"use client";

import React, { useState } from "react";
import {
    Briefcase,
    ChevronRight,
    DollarSign,
    Loader2,
    Tag,
    Users,
    Plus,
} from "lucide-react";
import { useOpenPostedJobs } from "@/features/posted-jobs/hooks/usePostedJobs";
import { PostedJob } from "@/features/posted-jobs/actions";
import { PostedJobDetailsModal } from "./PostedJobDetailsModal";
import { CreatePostedJobModal } from "./CreatePostedJobModal";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { useKycGate } from "@/hooks/useKycGate";
import FallbackImage from "@/components/ui/FallbackImage";

const DGE_LOGO = "/DGE logo.png";

function JobStatusBadge({ status }: { status: PostedJob["status"] }) {
    const colors: Record<string, string> = {
        open: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        assigned: "bg-blue-50 text-blue-700 border border-blue-200",
        completed: "bg-gray-100 text-gray-600",
        cancelled: "bg-red-50 text-red-600",
    };
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${colors[status] ?? "bg-gray-100"}`}>
            {status}
        </span>
    );
}

function JobCard({ job, onClick }: { job: PostedJob; onClick: () => void }) {
    const minK = (job.min_price_cents / 100).toLocaleString();
    const maxK = (job.max_price_cents / 100).toLocaleString();

    return (
        <button
            onClick={onClick}
            className="w-full text-left group bg-white rounded-2xl border border-gray-100 hover:border-[#C69C2E]/40 hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            {/* Image */}
            <div className="relative w-full h-28 bg-gray-50">
                <FallbackImage
                    src={getBackendImageUrl(job.image)}
                    alt={job.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-2 right-2">
                    <JobStatusBadge status={job.status} />
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-[#C69C2E] transition-colors">
                    {job.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                    {job.category?.name ?? "General"}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[#C69C2E]">
                        <span className="text-xs font-bold">₦{minK} – ₦{maxK}</span>
                    </div>
                    {job.bid_count !== undefined && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Users className="w-3 h-3" />
                            <span className="text-[10px]">{job.bid_count} bids</span>
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-gray-400 mt-1">
                    by @{job.user?.username ?? "Anonymous"}
                </p>
            </div>
        </button>
    );
}

export function PostedJobsSidebar() {
    const { data: jobs, isLoading } = useOpenPostedJobs();
    const [selectedJob, setSelectedJob] = useState<PostedJob | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { checkKyc, KycGateModal } = useKycGate();

    return (
        <aside className="w-full space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-[#C69C2E]" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-sm">Posted Jobs</h2>
                    </div>
                    <button
                        onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                        className="flex items-center gap-1 text-[11px] bg-[#C69C2E] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#b08b29] transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Post Job
                    </button>
                </div>
                <p className="text-[11px] text-gray-400">Browse requests for services from clients</p>
            </div>

            {/* Jobs List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C69C2E]" />
                    </div>
                ) : !jobs || jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                        <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No open jobs yet</p>
                        <button
                            onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                            className="mt-2 text-[#C69C2E] text-xs font-semibold hover:underline"
                        >
                            Be the first to post!
                        </button>
                    </div>
                ) : (
                    jobs.map((job: PostedJob) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onClick={() => setSelectedJob(job)}
                        />
                    ))
                )}
            </div>

            {selectedJob && (
                <PostedJobDetailsModal
                    job={selectedJob}
                    open={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}

            <CreatePostedJobModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
            {KycGateModal}
        </aside>
    );
}
