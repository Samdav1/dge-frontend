"use client";

import { ServiceDetails } from "@/features/marketplace/components/ServiceDetails";
import { useParams } from "next/navigation";
import { useService } from "@/features/marketplace/hooks/useMarketplace";
import { Loader2 } from "lucide-react";

export default function ServiceDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: backendData, isLoading, error } = useService(id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-96 text-red-500">
                {(error as Error).message || "Failed to fetch service details"}
            </div>
        );
    }

    if (!backendData) {
        return (
            <div className="flex justify-center items-center h-96 text-gray-500">
                Service not found
            </div>
        );
    }

    // Map backend data to component props
    const { service, profile, portfolio, user } = backendData;

    // Extract social links from the first portfolio item that has them, or default to empty
    // The user structure suggests these might be in portfolio items
    const portfolioItems = portfolio || [];
    const socialLinks = portfolioItems.find(p => p.website || p.facebook || p.twitter || p.instagram || p.youtube) || {} as Partial<import("@/types/marketplace").PortfolioItem>;

    const mediaFiles = portfolioItems.reduce((acc: any[], p: any) => acc.concat(p.media_files || []), []);
    const reviews = portfolioItems.reduce((acc: any[], p: any) => acc.concat(p.reviews || []), []);

    const mappedService = {
        id: service.id,
        title: service.name,
        description: service.description,
        price: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(service.price),
        originalPrice: service.discount
            ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(service.price / (1 - service.discount_percent / 100))
            : undefined,
        category: service.categories?.[0]?.name || "General",
        image: service.image,
        status: (service.status as "Active" | "Inactive") || "Active",
        tags: [service.type].filter(Boolean),
        longDescription: service.description,
        aboutJob: service.description,
        author: {
            id: service.user_id,
            name: service.username,
            role: "Service Provider",
            image: profile?.avatar_url || service.user_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.username || 'User')}&background=random`,
            rating: service.upvotes || 0,
            reviews: reviews.length,
            title: profile?.bio ? profile.bio.substring(0, 50) + "..." : "Service Provider",
            description: profile?.bio || "No description available.",
            website: socialLinks.website || "",
            phone: profile?.phone || "",
            email: user?.email || "", // Map email from user object
            facebook: socialLinks.facebook || "",
            twitter: socialLinks.twitter || "",
            instagram: socialLinks.instagram || "",
            youtube: socialLinks.youtube || "",
            media: mediaFiles,
            reviewsList: reviews
        }
    };

    return <ServiceDetails service={mappedService} />;
}
