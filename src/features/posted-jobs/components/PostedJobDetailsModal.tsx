"use client";

import React, { useState } from "react";
import {
    X,
    DollarSign,
    Tag,
    Users,
    Calendar,
    User,
    Loader2,
    CheckCircle,
    AlertCircle,
    Briefcase,
    MapPin,
} from "lucide-react";
import { PostedJob } from "@/features/posted-jobs/actions";
import { BidOnJobModal } from "./BidOnJobModal";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";
import { parseJobLocation, stripJobLocation } from "@/lib/countries-states";

const DGE_LOGO = "/DGE logo.png";

interface Props {
    job: PostedJob;
    open: boolean;
    onClose: () => void;
}

function StatusBadge({ status }: { status: PostedJob["status"] }) {
    const map: Record<string, { label: string; cls: string }> = {
        open: { label: "Open for Bids", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
        assigned: { label: "Assigned", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
        completed: { label: "Completed", cls: "bg-gray-100 text-gray-600" },
        cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
    };
    const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
    return (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${cls}`}>
            {label}
        </span>
    );
}

export function PostedJobDetailsModal({ job, open, onClose }: Props) {
    const [isBidOpen, setIsBidOpen] = useState(false);

    if (!open) return null;

    const minPrice = (job.min_price_cents / 100).toLocaleString();
    const maxPrice = (job.max_price_cents / 100).toLocaleString();
    const postedDate = new Date(job.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const location = parseJobLocation(job.description, job.title);
    const cleanDescription = stripJobLocation(job.description);

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image */}
                    <div className="relative w-full h-48 bg-gray-100">
                        <FallbackImage
                            src={getBackendImageUrl(job.image)}
                            alt={job.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-4 left-4">
                            <StatusBadge status={job.status} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{job.title}</h2>
                            {job.bid_count !== undefined && (
                                <div className="flex items-center gap-1 text-gray-500 shrink-0">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium">{job.bid_count}</span>
                                </div>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-2.5 mb-4">
                            {location.display && (
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 bg-amber-50/90 border border-amber-200/60 px-3 py-1.5 rounded-xl">
                                    <MapPin className="w-3.5 h-3.5 text-[#C69C2E]" />
                                    <span>{location.display}</span>
                                </div>
                            )}
                            {job.category && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>{job.category.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#C69C2E] bg-amber-50 px-3 py-1.5 rounded-xl">
                                <span>₦{minPrice} – ₦{maxPrice}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{job.payment_method === "cash" ? "Offline Cash" : "Platform Escrow"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{postedDate}</span>
                            </div>
                            {job.user && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                    <User className="w-3.5 h-3.5" />
                                    <span>@{job.user.username}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {cleanDescription}
                            </p>
                        </div>

                        {/* CTA */}
                        {job.status === "open" ? (
                            <button
                                onClick={() => setIsBidOpen(true)}
                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Briefcase className="w-4 h-4" />
                                Apply for This Job
                            </button>
                        ) : (
                            <div className="w-full bg-gray-100 text-gray-500 font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                This job is no longer accepting bids
                            </div>
                        )}

                        <p className="text-center text-[11px] text-gray-400 mt-3">
                            You must have a created service to apply for this job.
                        </p>
                    </div>
                </div>
            </div>

            {isBidOpen && (
                <BidOnJobModal
                    job={job}
                    open={isBidOpen}
                    onClose={() => {
                        setIsBidOpen(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
}
