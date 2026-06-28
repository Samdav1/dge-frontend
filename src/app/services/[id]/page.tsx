"use client";

import { ServiceDetails } from "@/features/marketplace/components/ServiceDetails";
import { useParams } from "next/navigation";
import { usePublicService } from "@/features/marketplace/hooks/useMarketplace";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicServiceDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: backendData, isLoading, error } = usePublicService(id);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 md:px-8 max-w-[1600px] py-12">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-96 text-red-500">
                        {(error as Error).message || "Failed to fetch service details"}
                    </div>
                ) : !backendData ? (
                    <div className="flex justify-center items-center h-96 text-gray-500">
                        Service not found
                    </div>
                ) : (
                    <ServiceDetails service={mapBackendDataToService(backendData)} isPublic={true} />
                )}
            </main>
            <Footer />
        </div>
    );
}

// Helper to map backend data to component props
function mapBackendDataToService(backendData: import("@/types/marketplace").ServiceDetailResponse) {
    const { service, profile, portfolio, user } = backendData;

    const portfolioItems = portfolio || [];
    const socialLinks = portfolioItems.find(p => p.website || p.facebook || p.twitter || p.instagram || p.youtube) || {} as Partial<import("@/types/marketplace").PortfolioItem>;

    const mediaFiles = portfolioItems.reduce((acc: any[], p: any) => acc.concat(p.media_files || []), []);
    const reviews = portfolioItems.reduce((acc: any[], p: any) => acc.concat(p.reviews || []), []);

    return {
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
        tags: [service.type, ...(service.status ? [service.status] : [])],
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
            email: user?.email || "",
            facebook: socialLinks.facebook || "",
            twitter: socialLinks.twitter || "",
            instagram: socialLinks.instagram || "",
            youtube: socialLinks.youtube || "",
            media: mediaFiles,
            reviewsList: reviews
        }
    };
}
