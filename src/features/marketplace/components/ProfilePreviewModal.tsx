"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Star, Phone, Mail, Play, Globe, Facebook, Youtube, Twitter, Instagram } from "lucide-react";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";

interface ProfilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        image?: string;
        rating?: number;
        title?: string;
        reviewsCount?: number;
        description?: string;
        phone?: string;
        altPhone?: string;
        email?: string;
        media?: any[];
        reviews?: any[];
        website?: string;
        facebook?: string;
        youtube?: string;
        twitter?: string;
        instagram?: string;
    };
}

export function ProfilePreviewModal({ isOpen, onClose, user }: ProfilePreviewModalProps) {
    const reviews = user.reviews || [];
    const reviewsCount = reviews.length;
    
    // Average rating
    const averageRating = reviewsCount > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
        : (user.rating || 5.0).toFixed(1);

    const displayUser = {
        name: user.name,
        image: user.image,
        rating: averageRating,
        reviewsCount: reviewsCount,
        title: user.title || "Service Provider",
        description: user.description || "No description available.",
        phone: user.phone || "Not provided",
        altPhone: user.altPhone || "Not provided",
        email: user.email || "Not provided",
        media: user.media || [],
        reviews: reviews,
        website: user.website || "",
        facebook: user.facebook || "",
        youtube: user.youtube || "",
        twitter: user.twitter || "",
        instagram: user.instagram || "",
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-full !h-full !rounded-none !p-0 !border-l z-50 bg-white shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 sm:!inset-auto sm:!left-auto sm:!right-0 sm:!top-0 sm:!bottom-0 sm:!w-[725px] sm:!max-w-[725px] sm:!h-full sm:!rounded-l-2xl sm:!rounded-r-none sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right">
                <div className="h-full overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <DialogTitle className="text-xl font-bold text-gray-900">Profile Preview</DialogTitle>
                    </div>

                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 mb-4 border-4 border-white shadow-sm flex items-center justify-center">
                            <FallbackImage 
                                src={displayUser.image ? getBackendImageUrl(displayUser.image) : undefined} 
                                alt={displayUser.name} 
                                username={displayUser.name}
                                isAvatar={true}
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayUser.name}</h2>
                        <p className="text-gray-500 text-sm mb-2">{displayUser.title}</p>
                        <div className="flex items-center gap-1 mb-4">
                            <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const ratingVal = parseFloat(displayUser.rating);
                                    return (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(ratingVal) ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-gray-200 text-gray-200'}`} />
                                    );
                                })}
                            </div>
                            <span className="text-sm font-medium text-gray-900 ml-1">{displayUser.rating}</span>
                            <span className="text-sm text-gray-400">({displayUser.reviewsCount})</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {displayUser.website && (
                                <a href={displayUser.website.startsWith('http') ? displayUser.website : `https://${displayUser.website}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#C69C2E] hover:text-white transition-colors">
                                    <Globe className="w-4 h-4" />
                                </a>
                            )}
                            {displayUser.facebook && (
                                <a href={displayUser.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-colors">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            {displayUser.twitter && (
                                <a href={displayUser.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                            )}
                            {displayUser.instagram && (
                                <a href={displayUser.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#E4405F] hover:text-white transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {displayUser.youtube && (
                                <a href={displayUser.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#FF0000] hover:text-white transition-colors">
                                    <Youtube className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {displayUser.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-[#C69C2E]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">ALT PHONE</p>
                                        <p className="text-sm font-medium text-gray-900">{displayUser.altPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-[#C69C2E]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">PHONE</p>
                                        <p className="text-sm font-medium text-gray-900">{displayUser.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-[#C69C2E]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">EMAIL ADDRESS</p>
                                        <p className="text-sm font-medium text-gray-900">{displayUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Media</h3>
                            {displayUser.media && displayUser.media.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {displayUser.media.map((item: any, idx: number) => {
                                        const isVideo = item.media_type?.startsWith("video");
                                        const url = getBackendImageUrl(item.s3_key);
                                        return (
                                            <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-950/90 relative group cursor-pointer border border-gray-100 p-1 flex items-center justify-center">
                                                {isVideo ? (
                                                    <video src={url} className="w-full h-full object-contain" preload="metadata" />
                                                ) : (
                                                    <FallbackImage src={url} alt={`Portfolio Media ${idx + 1}`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                                )}
                                                {isVideo && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                            <Play className="w-3 h-3 text-black fill-black ml-0.5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No media uploaded to portfolio.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews & Feedback</h3>
                            {displayUser.reviews && displayUser.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {displayUser.reviews.map((rev: any, idx: number) => (
                                        <div key={rev.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                                                        <FallbackImage 
                                                            src={rev.reviewer_avatar ? getBackendImageUrl(rev.reviewer_avatar) : undefined} 
                                                            alt={rev.reviewer_name} 
                                                            username={rev.reviewer_name}
                                                            isAvatar={true}
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{rev.reviewer_name}</h4>
                                                        <p className="text-[10px] text-gray-400">
                                                            {new Date(rev.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-gray-200 text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed pl-10">
                                                {rev.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No reviews yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
