"use client";

import React, { useState } from "react";
import {
    Briefcase,
    Loader2,
    DollarSign,
    Users,
    Tag,
    Calendar,
    ChevronRight,
    X,
    Plus,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";
import { useMyPostedJobs, useJobBids } from "@/features/posted-jobs/hooks/usePostedJobs";
import { PostedJob, PostedJobBid, cancelPostedJob, acceptBid, rejectBid } from "@/features/posted-jobs/actions";
import { CreatePostedJobModal } from "@/features/posted-jobs/components/CreatePostedJobModal";
import { useQueryClient } from "@tanstack/react-query";
import { useKycGate } from "@/hooks/useKycGate";

const DGE_LOGO = "/DGE logo.png";

const STATUS_STYLES: Record<string, string> = {
    open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    assigned: "bg-blue-50 text-blue-700 border border-blue-200",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-50 text-red-600 border border-red-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-50 text-red-500",
};

function JobBidCard({
    bid,
    onAccept,
    onReject,
    jobStatus,
}: {
    bid: PostedJobBid;
    onAccept: () => void;
    onReject: () => void;
    jobStatus: PostedJob["status"];
}) {
    const price = (bid.proposed_price_cents / 100).toLocaleString();
    const svcName = bid.services?.name ?? "Unknown Service";
    const bidderName = bid.initiator?.username ?? "Unknown";
    const date = new Date(bid.created_at).toLocaleDateString();

    return (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <p className="font-semibold text-sm text-gray-900">@{bidderName}</p>
                    <p className="text-xs text-gray-500">{svcName}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_STYLES[bid.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {bid.status}
                </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#C69C2E] mb-2">
                <span className="font-bold text-[#C69C2E] text-xs">₦</span>
                <span className="font-bold text-sm">{price}</span>
            </div>

            {bid.message && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">"{bid.message}"</p>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-3">
                <Calendar className="w-3 h-3" />
                {date}
            </div>

            {bid.status === "pending" && jobStatus === "open" && (
                <div className="flex gap-2">
                    <button
                        onClick={onAccept}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl transition-colors border border-red-200"
                    >
                        <X className="w-3.5 h-3.5" /> Reject
                    </button>
                </div>
            )}
        </div>
    );
}

function JobDetailPanel({
    job,
    onClose,
}: {
    job: PostedJob;
    onClose: () => void;
}) {
    const qc = useQueryClient();
    const { data: bids, isLoading: bidsLoading } = useJobBids(job.id);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleAccept = async (bidId: string) => {
        setActionLoading(bidId);
        setActionError(null);
        const result = await acceptBid(bidId);
        if (!result.success) setActionError(result.error ?? "Failed to accept bid");
        else {
            qc.invalidateQueries({ queryKey: ["posted_jobs"] });
            onClose();
        }
        setActionLoading(null);
    };

    const handleReject = async (bidId: string) => {
        setActionLoading(bidId);
        setActionError(null);
        const result = await rejectBid(bidId);
        if (!result.success) setActionError(result.error ?? "Failed to reject bid");
        else qc.invalidateQueries({ queryKey: ["posted_jobs", "bids", job.id] });
        setActionLoading(null);
    };

    const minPrice = (job.min_price_cents / 100).toLocaleString();
    const maxPrice = (job.max_price_cents / 100).toLocaleString();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="relative h-36">
                <FallbackImage
                    src={getBackendImageUrl(job.image)}
                    alt={job.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-3 left-4">
                    <h3 className="text-white font-bold text-base line-clamp-1">{job.title}</h3>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[job.status]}`}>
                        {job.status}
                    </span>
                    {job.category && (
                        <span className="text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                            {job.category.name}
                        </span>
                    )}
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full capitalize">
                        Method: {job.payment_method === "cash" ? "Offline Cash" : "Platform Escrow"}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[#C69C2E] font-bold text-sm">
                    ₦{minPrice} – ₦{maxPrice}
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">{job.description}</p>
            </div>

            {/* Bids */}
            <div className="p-4">
                <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Bids ({bids?.length ?? 0})
                </h4>

                {actionError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {actionError}
                    </div>
                )}

                {bidsLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-[#C69C2E]" />
                    </div>
                ) : !bids || bids.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                        <Clock className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs">No bids yet. Waiting for providers...</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {bids.map((bid: PostedJobBid) => (
                            <div key={bid.id} className="relative">
                                {actionLoading === bid.id && (
                                    <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#C69C2E]" />
                                    </div>
                                )}
                                <JobBidCard
                                    bid={bid}
                                    jobStatus={job.status}
                                    onAccept={() => handleAccept(bid.id)}
                                    onReject={() => handleReject(bid.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    isLoading,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PostedJobCard({
    job,
    isSelected,
    onClick,
    onCancel,
}: {
    job: PostedJob;
    isSelected: boolean;
    onClick: () => void;
    onCancel?: (e: React.MouseEvent) => void;
}) {
    const minPrice = (job.min_price_cents / 100).toLocaleString();
    const maxPrice = (job.max_price_cents / 100).toLocaleString();
    const date = new Date(job.created_at).toLocaleDateString();

    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl border transition-all duration-200 overflow-hidden hover:shadow-md ${
                isSelected ? "border-[#C69C2E] shadow-md" : "border-gray-100 hover:border-gray-200"
            }`}
        >
            <div className="flex items-stretch gap-0">
                {/* Image */}
                <div className="relative w-20 h-20 shrink-0">
                    <FallbackImage
                        src={getBackendImageUrl(job.image)}
                        alt={job.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 line-clamp-1">{job.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{job.category?.name ?? "General"}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[job.status]}`}>
                                {job.status}
                            </span>
                            {onCancel && job.status === "open" && (
                                <button
                                    onClick={onCancel}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Cancel Job"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-[#C69C2E]">₦{minPrice} – ₦{maxPrice}</span>
                        <div className="flex items-center gap-1 text-gray-400">
                            <Users className="w-3 h-3" />
                            <span className="text-[10px]">{job.bid_count ?? 0} bids</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center px-2 text-gray-300">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
}

export function PostedJobsTab() {
    const qc = useQueryClient();
    const { data: jobs, isLoading } = useMyPostedJobs();
    const [selectedJob, setSelectedJob] = useState<PostedJob | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { checkKyc, KycGateModal } = useKycGate();

    const handleCancel = async () => {
        if (!confirmDeleteId) return;
        const jobId = confirmDeleteId;
        setCancellingId(jobId);
        await cancelPostedJob(jobId);
        qc.invalidateQueries({ queryKey: ["posted_jobs"] });
        if (selectedJob?.id === jobId) setSelectedJob(null);
        setCancellingId(null);
        setConfirmDeleteId(null);
    };

    return (
        <div>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                    {jobs?.length ?? 0} posted job{jobs?.length !== 1 ? "s" : ""}
                </p>
                <button
                    onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                    className="flex items-center gap-1.5 bg-[#C69C2E] hover:bg-[#b08b29] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Post New Job
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-7 h-7 animate-spin text-[#C69C2E]" />
                </div>
            ) : !jobs || jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
                    <Briefcase className="w-10 h-10 text-gray-200" />
                    <p className="text-sm">You haven't posted any jobs yet.</p>
                    <button
                        onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                        className="text-[#C69C2E] text-sm font-semibold hover:underline"
                    >
                        Post your first job →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Job list */}
                    <div className="lg:col-span-2 space-y-3">
                        {jobs.map((job: PostedJob) => (
                            <div key={job.id} className="relative">
                                {cancellingId === job.id && (
                                    <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#C69C2E]" />
                                    </div>
                                )}
                                <PostedJobCard
                                    job={job}
                                    isSelected={selectedJob?.id === job.id}
                                    onClick={() => setSelectedJob(job)}
                                    onCancel={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(job.id);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Job Detail / Bids Panel */}
                    <div className="lg:col-span-3">
                        {selectedJob ? (
                            <JobDetailPanel
                                job={selectedJob}
                                onClose={() => setSelectedJob(null)}
                            />
                        ) : (
                            <div className="h-full min-h-48 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                                <Briefcase className="w-8 h-8 mb-2 text-gray-200" />
                                <p className="text-sm">Select a job to view bids</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreatePostedJobModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

            <ConfirmModal
                open={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleCancel}
                title="Cancel Job"
                message="Are you sure you want to cancel this job? This action cannot be undone."
                isLoading={!!cancellingId}
            />
            {KycGateModal}
        </div>
    );
}
