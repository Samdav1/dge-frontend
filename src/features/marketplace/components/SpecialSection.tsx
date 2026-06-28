import { MarketplaceSectionSkeleton } from "./MarketplaceCardSkeleton";
import React, { useState, useEffect } from "react";
import { MarketplaceCard } from "./MarketplaceCard";
import { listServices } from "../actions";
import { TrendingUp, Sparkles, Zap } from "lucide-react";

interface SpecialSectionProps {
    title: string;
    subtitle: string;
    sortBy: "trending" | "affordable" | "newest";
    limit?: number;
    icon: "trending" | "sparkles" | "zap";
    theme: "dark" | "gold" | "emerald" | "blue" | "light";
}

export function SpecialSection({ title, subtitle, sortBy, limit = 4, icon, theme }: SpecialSectionProps) {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecial = async () => {
            setLoading(true);
            try {
                const result = await listServices({
                    limit,
                    offset: 0,
                    sortBy
                });

                if (result.success && Array.isArray(result.data)) {
                    setServices(result.data);
                }
            } catch (err) {
                console.error("Failed to load special section:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecial();
    }, [sortBy, limit]);

    const isDarkTheme = theme === "dark";

    const IconComponent = icon === "trending" ? TrendingUp : icon === "sparkles" ? Sparkles : Zap;

    if (loading) {
        return (
            <div className={`relative overflow-hidden rounded-[2rem] border p-6 md:p-8 ${
                isDarkTheme 
                    ? "bg-gray-900 dark:bg-[#0D0D0D] border-gray-800 dark:border-[#2A2A2A]" 
                    : "bg-[#C69C2E]/5 border-[#C69C2E]/20"
            }`}>
                <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3 w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-[#2A2A2A] animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-[#2A2A2A] rounded-md animate-pulse" />
                        </div>
                        <div className="h-8 w-64 bg-gray-200 dark:bg-[#2A2A2A] rounded-md animate-pulse" />
                    </div>
                </div>
                <MarketplaceSectionSkeleton count={limit} />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-[2rem] border p-6 md:p-8 ${
            isDarkTheme 
                ? "bg-gray-900 dark:bg-[#0D0D0D] border-gray-800 dark:border-[#2A2A2A] text-white" 
                : "bg-[#C69C2E]/5 border-[#C69C2E]/20 text-gray-900 dark:text-white"
        }`}>
            <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-xl ${isDarkTheme ? 'bg-white/10 backdrop-blur-sm' : 'bg-[#C69C2E]/10'}`}>
                            <IconComponent className="w-5 h-5 text-[#C69C2E]" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-[#C69C2E]">
                            {subtitle}
                        </span>
                    </div>
                    <h2 className={`text-2xl md:text-4xl font-extrabold tracking-tight ${isDarkTheme ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {title}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {services.map((item: any, index: number) => {
                    const service = item.service || item;
                    const profile = item.profile;
                    const user = item.user;
                    const portfolio = item.portfolio || [];

                    const socialLinks = portfolio.find((p: any) => p.website || p.facebook || p.twitter || p.instagram || p.youtube) || {};
                    const avatarUrl = profile?.avatar_url || service.user_picture;
                    const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.username || 'User')}&background=random`;

                    const mediaFiles = portfolio.reduce((acc: any[], p: any) => acc.concat(p.media_files || []), []);
                    const reviews = portfolio.reduce((acc: any[], p: any) => acc.concat(p.reviews || []), []);

                    return (
                        <div key={`${service.id}-${index}`} className="transform hover:-translate-y-1 transition-transform duration-300">
                            <MarketplaceCard
                                id={service.id}
                                title={service.name}
                                description={service.description}
                                price={service.price}
                                discount={service.discount}
                                discount_percent={service.discount_percent}
                                type={service.type}
                                image={service.image}
                                author={{
                                    name: service.username,
                                    image: displayAvatar,
                                    rating: service.upvotes,
                                    email: user?.email || service.user_id,
                                    title: profile?.bio ? profile.bio.substring(0, 50) + "..." : "Service Provider",
                                    description: profile?.bio || "No description available.",
                                    phone: profile?.phone || "",
                                    altPhone: "",
                                    website: socialLinks.website || "",
                                    facebook: socialLinks.facebook || "",
                                    youtube: socialLinks.youtube || "",
                                    twitter: socialLinks.twitter || "",
                                    instagram: socialLinks.instagram || "",
                                    reviewsCount: reviews.length,
                                    media: mediaFiles,
                                    reviews: reviews
                                }}
                                category={service.categories?.[0]?.name}
                                status={service.status}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
