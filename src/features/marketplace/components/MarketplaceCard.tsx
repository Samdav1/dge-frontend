"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { useState } from "react";
import { ProfilePreviewModal } from "./ProfilePreviewModal";
import FallbackImage from "@/components/ui/FallbackImage";

interface MarketplaceCardProps {
    id: string;
    title: string;
    description: string;
    price: number;
    discount: boolean;
    discount_percent: number;
    type: string;
    category?: string;
    author?: {
        name: string;
        image?: string;
        rating?: number;
        email?: string;
        // Extended profile data
        title?: string;
        reviewsCount?: number;
        description?: string;
        phone?: string;
        altPhone?: string;
        website?: string;
        facebook?: string;
        youtube?: string;
        twitter?: string;
        instagram?: string;
        media?: any[];
        reviews?: any[];
    };
    image: string;
    status?: string;
    tags?: string[];
    viewType?: "grid" | "list";
}

export function MarketplaceCard({
    id,
    title,
    description,
    price,
    discount,
    discount_percent,
    type,
    category,
    author,
    image,
    status,
    tags,
    viewType = "grid"
}: MarketplaceCardProps) {
    // Calculate discounted price
    const finalPrice = discount ? price - (price * discount_percent / 100) : price;

    // Format currency
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsProfileModalOpen(true);
    };

    return (
        <>
            <Link href={`/dashboard/marketplace/${id}`}>
                <div 
                    onClick={() => setIsClicked(true)}
                    className={`bg-white dark:bg-[#141414] rounded-[1rem] md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E] hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex ${viewType === "list" ? "flex-col sm:flex-row gap-4" : "flex-col"} ${
                        isClicked ? "pulse-grow-active" : ""
                    }`}
                >
                    <div className={`relative rounded-xl overflow-hidden shrink-0 ${viewType === "list" ? "h-40 sm:h-auto sm:w-48 md:w-64" : "h-28 md:h-40 mb-3 md:mb-4"}`}>
                        <FallbackImage
                            src={getBackendImageUrl(image)}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 md:top-3 right-2 md:right-3">
                            <span className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[9px] md:text-[10px] font-semibold text-[#4CAF50] uppercase tracking-wide">
                                {status || "Active"}
                            </span>
                        </div>
                        {discount && (
                            <div className="absolute top-2 md:top-3 left-2 md:left-3">
                                <span className="bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold">
                                    -{discount_percent}%
                                </span>
                            </div>
                        )}
                    </div>


                    <div className="flex flex-col flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-2 gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base line-clamp-1">{title}</h3>
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium capitalize ${type.toLowerCase() === 'online'
                                    ? 'bg-[#C69C2E]/10 text-[#C69C2E]'
                                    : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {type}
                                </span>
                            </div>
                            <div className={`flex flex-row ${viewType === "list" ? "sm:flex-row sm:items-center sm:gap-2" : "sm:flex-col items-center sm:items-end"} shrink-0 gap-1.5 sm:gap-0 w-full sm:w-auto`}>
                                <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{formatPrice(finalPrice)}</span>
                                {discount && (
                                    <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-through">
                                        {formatPrice(price)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={`mb-2 md:mb-4 ${viewType === "list" ? "block" : "hidden sm:block"}`}>
                            <p className={`text-[10px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1.5 md:mb-2 ${viewType === "list" ? "line-clamp-3" : "line-clamp-2"}`}>
                                {description}
                            </p>
                            {category && (
                                <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 truncate">
                                    Category: <span className="text-gray-600 dark:text-gray-300">{category}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 md:pt-4 border-t border-gray-50 dark:border-[#2A2A2A] mt-auto overflow-hidden">
                            {author ? (
                                <div
                                    className="flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] p-1 -ml-1 rounded-lg transition-colors overflow-hidden"
                                    onClick={handleProfileClick}
                                >
                                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                                        {author.image ? (
                                            <FallbackImage src={getBackendImageUrl(author.image)} alt={author.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400">{author.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{author.name}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 dark:bg-[#1A1A1A] shrink-0" />
                                    <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 truncate">Unknown</span>
                                </div>
                            )}

                            {author?.rating !== undefined && (
                                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                    <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                                    <span className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300">{author.rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link >

            {author && (
                <ProfilePreviewModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={author}
                />
            )}
        </>
    );
}
