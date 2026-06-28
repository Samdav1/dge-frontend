import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketplaceCard } from "./MarketplaceCard";
import { listServices } from "../actions";
import { Loader2, ChevronDown, PackageOpen, Plus, ArrowRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketplaceSectionSkeleton } from "./MarketplaceCardSkeleton";

interface CategorySectionProps {
    categoryId: string;
    title: string;
    searchTerm?: string;
    type?: string;
    initialLimit?: number;
    /** If true, show a friendly empty state instead of hiding the section */
    showEmptyState?: boolean;
    onLoadComplete?: () => void;
}

export function CategorySection({ 
    categoryId, 
    title, 
    searchTerm, 
    type, 
    initialLimit = 10, 
    showEmptyState = false,
    onLoadComplete 
}: CategorySectionProps) {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<"grid" | "list">("grid");

    // Initial fetch when filters or category changes
    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await listServices({
                    categoryId,
                    search: searchTerm,
                    type: type === "all" ? undefined : type,
                    limit: initialLimit,
                    offset: 0,
                    sortBy: "newest"
                });

                if (result.success && Array.isArray(result.data)) {
                    setServices(result.data);
                    setOffset(initialLimit);
                    setHasMore(result.data.length === initialLimit);
                } else {
                    setError(result.error || "Failed to fetch services");
                }
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
                if (onLoadComplete) {
                    onLoadComplete();
                }
            }
        };

        fetchInitial();
    }, [categoryId, searchTerm, type, initialLimit]);

    const loadMore = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        try {
            const result = await listServices({
                categoryId,
                search: searchTerm,
                type: type === "all" ? undefined : type,
                limit: initialLimit,
                offset: offset,
                sortBy: "newest"
            });

            if (result.success && Array.isArray(result.data)) {
                setServices(prev => [...prev, ...result.data]);
                setOffset(prev => prev + initialLimit);
                setHasMore(result.data.length === initialLimit);
            }
        } catch (err: any) {
            console.error("Failed to load more:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6 md:p-8 rounded-[2rem] border bg-white dark:bg-[#141414] border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                    <div className="h-7 w-48 bg-gray-200 dark:bg-[#2A2A2A] rounded-md animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-[#2A2A2A] rounded-full animate-pulse" />
                </div>
                <MarketplaceSectionSkeleton count={initialLimit > 8 ? 8 : initialLimit} />
            </div>
        );
    }

    if (error) {
        return null;
    }

    if (services.length === 0) {
        // When viewing a specific category (showEmptyState=true), show a helpful message.
        // When in the default all-categories feed, hide silently to keep things clean.
        if (!showEmptyState) return null;
        return (
            <div className="flex flex-col items-center justify-center gap-5 p-10 md:p-14 rounded-[2rem] border border-dashed border-[#C69C2E]/30 bg-[#C69C2E]/5 dark:bg-[#C69C2E]/5 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#C69C2E]/10 shadow-sm">
                    <PackageOpen className="w-8 h-8 text-[#C69C2E] opacity-50" />
                </div>

                {/* Copy */}
                <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                        No services listed here yet. Be the first to offer your skills in{" "}
                        <span className="font-semibold text-[#C69C2E]">{title}</span>!
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
                    <Link href="/dashboard/my-jobs">
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C69C2E] hover:bg-[#b08b29] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            List Your Service
                        </button>
                    </Link>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        or check back later
                        <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 md:p-8 rounded-[2rem] border bg-white dark:bg-[#141414] border-gray-100 dark:border-[#2A2A2A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#C69C2E]/10 text-[#C69C2E]">
                        {services.length} {services.length === 1 ? 'Service' : 'Services'}
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] p-1 rounded-lg border border-gray-200 dark:border-[#2A2A2A] self-start sm:self-auto">
                    <button
                        onClick={() => setViewType("grid")}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            viewType === "grid" 
                                ? "bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewType("list")}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            viewType === "list" 
                                ? "bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm" 
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className={viewType === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" : "flex flex-col gap-4"}>
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
                        <MarketplaceCard
                            key={`${service.id}-${index}`}
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
                            category={service.categories?.[0]?.name || title}
                            status={service.status}
                            viewType={viewType}
                        />
                    );
                })}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="rounded-xl px-8 h-12 gap-2 transition-colors hover:bg-[#C69C2E]/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2A2A] hover:border-[#C69C2E]/30"
                    >
                        {loadingMore ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                        Load More in {title}
                    </Button>
                </div>
            )}
        </div>
    );
}
