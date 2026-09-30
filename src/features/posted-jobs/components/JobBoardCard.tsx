"use client";

import React from "react";
import { Users, DollarSign, Calendar, Tag, MapPin } from "lucide-react";
import { PostedJob } from "../actions";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";
import { parseJobLocation, stripJobLocation } from "@/lib/countries-states";

interface JobBoardCardProps {
    job: PostedJob;
    onClick: () => void;
}

const DGE_LOGO = "/DGE logo.png";

function JobStatusBadge({ status }: { status: PostedJob["status"] }) {
    const colors: Record<string, string> = {
        open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        assigned: "bg-blue-50 text-blue-700 border border-blue-200",
        completed: "bg-gray-100 text-gray-600",
        cancelled: "bg-red-50 text-red-600",
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${colors[status] ?? "bg-gray-100"}`}>
            {status}
        </span>
    );
}

export function JobBoardCard({ job, onClick }: JobBoardCardProps) {
    const [isClicked, setIsClicked] = React.useState(false);

    const handleCardClick = () => {
        setIsClicked(true);
        onClick();
        setTimeout(() => setIsClicked(false), 500);
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(cents / 100);
    };

    const minPrice = formatPrice(job.min_price_cents);
    const maxPrice = formatPrice(job.max_price_cents);
    const date = new Date(job.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const location = parseJobLocation(job.description, job.title);
    const cleanDescription = stripJobLocation(job.description);

    return (
        <div 
            onClick={handleCardClick}
            className={`bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#C69C2E] hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full ${
                isClicked ? "pulse-grow-active" : ""
            }`}
        >
            {/* Header with Image and Status */}
            <div className="relative h-44 rounded-xl overflow-hidden mb-5 shrink-0 bg-gray-50">
                <FallbackImage
                    src={getBackendImageUrl(job.image || "")}
                    alt={job.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                    <JobStatusBadge status={job.status} />
                </div>
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-white">
                        <Tag className="w-3 h-3 text-[#C69C2E]" />
                        <span className="text-[10px] font-semibold">{job.category?.name || "General"}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-white">
                        <DollarSign className="w-3 h-3 text-[#C69C2E]" />
                        <span className="text-[10px] font-semibold">{job.payment_method === "cash" ? "Cash" : "Escrow"}</span>
                    </div>
                </div>
            </div>

            {/* Title and Budget */}
            <div className="flex justify-between items-start gap-4 mb-1.5">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-[#C69C2E] transition-colors flex-1">
                    {job.title}
                </h3>
            </div>

            {/* Location Badge */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3.5">
                <MapPin className="w-3.5 h-3.5 text-[#C69C2E] shrink-0" />
                <span className="font-medium truncate">{location.display}</span>
            </div>

            {/* Price Range */}
            <div className="bg-[#C69C2E]/5 rounded-xl p-3 mb-4 flex items-center justify-between border border-[#C69C2E]/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#C69C2E]/20">
                        <DollarSign className="w-4 h-4 text-[#C69C2E]" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Budget Range</p>
                        <p className="text-sm font-bold text-gray-900">{minPrice} - {maxPrice}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Bids</p>
                    <div className="flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3 text-[#C69C2E]" />
                        <span className="text-sm font-bold text-gray-900">{job.bid_count || 0}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-1">
                {cleanDescription}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <span className="text-xs font-bold text-gray-500">
                            {job.user?.username?.charAt(0).toUpperCase() || "A"}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400">Posted by</p>
                        <p className="text-xs font-semibold text-gray-700">@{job.user?.username || "anonymous"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{date}</span>
                </div>
            </div>
        </div>
    );
}
