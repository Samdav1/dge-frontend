"use client";

import { useState } from "react";
import { ArrowLeft, Globe, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NegotiationModal } from "./NegotiationModal";
import { SuccessModal } from "./SuccessModal";
import { ProfilePreviewModal } from "./ProfilePreviewModal";
import { createNegotiation } from "@/features/negotiation/actions";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { Loader2 } from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";
import { useStatusModal } from "@/app/admin/components/StatusModalProvider";
import { useRouter } from "next/navigation";

interface ServiceDetailsProps {
    service: {
        id: string;
        title: string;
        description: string;
        price: string;
        originalPrice?: string;
        category: string;
        image: string;
        status: "Active" | "Inactive";
        tags: string[];
        longDescription: string;
        aboutJob: string;
        author: {
            id?: string;
            name: string;
            role: string;
            image: string;
            rating: number;
            reviews: number;
            website: string;
            phone: string;
            email: string;
            facebook?: string;
            twitter?: string;
            instagram?: string;
            youtube?: string;
            title?: string;
            description?: string;
            media?: any[];
            reviewsList?: any[];
        };
    };
    isPublic?: boolean;
}

export function ServiceDetails({ service, isPublic = false }: ServiceDetailsProps) {
    const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
    const [isNegotiationSuccessOpen, setIsNegotiationSuccessOpen] = useState(false);
    const [isApplicationSuccessOpen, setIsApplicationSuccessOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { showModal } = useStatusModal();
    const router = useRouter();

    const handleNegotiationSubmit = () => {
        setIsNegotiationModalOpen(false);
        setIsNegotiationSuccessOpen(true);
    };

    const handleApply = async () => {
        if (isPublic) {
            router.push("/login");
            return;
        }

        setIsApplying(true);
        try {
            // Parse price string to number (remove currency symbol and commas)
            const priceString = service.price.replace(/[^0-9.]/g, '');
            const price = parseFloat(priceString);
            const priceInCents = Math.round(price * 100);

            const result = await createNegotiation({
                service_id: service.id,
                receiver_id: service.author.id || "",
                proposed_price_cents: priceInCents,
                message: `I would like to apply for this service: ${service.title}`,
            });

            if (result.success) {
                setIsApplicationSuccessOpen(true);
            } else {
                showModal({
                    type: "error",
                    title: "Application Failed",
                    message: result.error || "Failed to apply for service"
                });
            }
        } catch (err) {
            console.error("Application error:", err);
            showModal({
                type: "error",
                title: "Unexpected Error",
                message: "An unexpected error occurred while applying."
            });
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={isPublic ? "/" : "/dashboard/marketplace"}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Services Details</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
                    <Link href={isPublic ? "/" : "/dashboard"} className="hover:text-gray-900">Home</Link>
                    <span>/</span>
                    <Link href={isPublic ? "/#services" : "/dashboard/marketplace"} className="hover:text-gray-900">
                        {isPublic ? "Services" : "Marketplace"}
                    </Link>
                    <span>/</span>
                    <span className="text-[#C69C2E]">Details</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Card */}
                    <div className="bg-white rounded-3xl p-4 border border-gray-100">
                        <div className="relative h-64 sm:h-[400px] w-full rounded-2xl overflow-hidden mb-6">
                            <FallbackImage
                                src={getBackendImageUrl(service.image)}
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="px-2 pb-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="space-y-3 w-full">
                                    <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {service.tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                                            {service.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    {service.originalPrice && (
                                        <span className="block text-sm text-gray-400 line-through mb-1">
                                            {service.originalPrice}
                                        </span>
                                    )}
                                    <span className="block text-2xl font-bold text-gray-900">
                                        {service.price}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">About the Service:</h3>
                                    <p className="whitespace-pre-wrap">{service.description}</p>
                                </div>

                                <div className="pt-4">
                                    <span className="text-gray-500">Category: </span>
                                    <span className="font-medium text-gray-900">{service.category}</span>
                                </div>

                                <div className="pt-8 border-t border-gray-100 mt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Service Reviews</h3>
                                    {service.author.reviewsList && service.author.reviewsList.length > 0 ? (
                                        <div className="space-y-4">
                                            {service.author.reviewsList.map((rev: any, idx: number) => (
                                                <div key={rev.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                                                                {rev.reviewer_avatar ? (
                                                                    <FallbackImage src={getBackendImageUrl(rev.reviewer_avatar)} alt={rev.reviewer_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-500">{rev.reviewer_name?.charAt(0).toUpperCase() || 'A'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{rev.reviewer_name}</h4>
                                                                <p className="text-xs text-gray-400">
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
                                                                <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-gray-200 text-gray-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed pl-[3.25rem]">
                                                        {rev.comment}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            This service hasn't received any reviews yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <Button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="flex-1 bg-[#C69C2E] hover:bg-[#B08B29] text-white h-12 rounded-xl text-base font-medium w-full"
                                >
                                    {isApplying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Applying...
                                        </>
                                    ) : (
                                        "Apply"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => isPublic ? router.push("/login") : setIsNegotiationModalOpen(true)}
                                    className="flex-1 border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/5 h-12 rounded-xl text-base font-medium w-full"
                                >
                                    Make Negotiation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100">
                        <div 
                            className="flex items-start gap-4 mb-6 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
                                <FallbackImage src={getBackendImageUrl(service.author.image)} alt={service.author.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{service.author.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{service.author.role}</p>
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(service.author.rating) ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 ml-1">{service.author.rating}</span>
                                    <span className="text-sm text-gray-500">({service.author.reviews})</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                            <Globe className="w-4 h-4 text-[#C69C2E]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">WEBSITE</p>
                                            <p className="text-sm font-medium text-gray-900">{service.author.website}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4 text-[#C69C2E]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">PHONE</p>
                                            <p className="text-sm font-medium text-gray-900">{service.author.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4 text-[#C69C2E]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">EMAIL ADDRESS</p>
                                            <p className="text-sm font-medium text-gray-900">{service.author.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">Social</h4>
                                <div className="flex gap-3">
                                    {service.author.facebook && (
                                        <a href={service.author.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    )}
                                    {service.author.twitter && (
                                        <a href={service.author.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                    {service.author.instagram && (
                                        <a href={service.author.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {service.author.youtube && (
                                        <a href={service.author.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors">
                                            <Youtube className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProfilePreviewModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={{
                    ...service.author,
                    reviews: service.author.reviewsList
                }}
            />

            <NegotiationModal
                isOpen={isNegotiationModalOpen}
                onClose={() => setIsNegotiationModalOpen(false)}
                onSubmit={handleNegotiationSubmit}
                initialPrice={service.price}
                serviceId={service.id}
                receiverId={service.author?.id || ""}
            />

            <SuccessModal
                isOpen={isNegotiationSuccessOpen}
                onClose={() => setIsNegotiationSuccessOpen(false)}
                title="Negotiation sent successfully"
                message="Your negotiation has been sent successfully"
            />

            <SuccessModal
                isOpen={isApplicationSuccessOpen}
                onClose={() => setIsApplicationSuccessOpen(false)}
                title="Application sent successfully"
                message="Your application has been sent successfully"
            />
        </div>
    );
}
