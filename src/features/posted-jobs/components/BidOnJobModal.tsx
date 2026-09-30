"use client";

import React, { useState } from "react";
import { X, Loader2, AlertCircle, CheckCircle, DollarSign, Briefcase, Coins } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostedJob, bidOnPostedJob } from "@/features/posted-jobs/actions";
import { listServices } from "@/features/marketplace/actions";

interface Props {
    job: PostedJob;
    open: boolean;
    onClose: () => void;
}

interface MyService {
    id: string;
    name: string;
    type: string;
    price?: number;
}

function useMyServices() {
    return useQuery({
        queryKey: ["my-services"],
        queryFn: async () => {
            const result = await listServices({ onlyMine: true, status: "approved" });
            if (!result.success) throw new Error(result.error);
            // Extract service from response
            const raw = result.data as any[];
            return raw.map((item: any) => item.service ?? item) as MyService[];
        },
    });
}

export function BidOnJobModal({ job, open, onClose }: Props) {
    const qc = useQueryClient();
    const { data: myServices, isLoading: isLoadingServices } = useMyServices();

    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!open) return null;

    const minK = (job.min_price_cents / 100);
    const maxK = (job.max_price_cents / 100);

    const handleSubmit = async () => {
        if (!selectedServiceId) { setError("Please select a service."); return; }
        const priceCents = Math.round(parseFloat(price) * 100);
        if (isNaN(priceCents) || priceCents <= 0) { setError("Please enter a valid price."); return; }
        if (priceCents < job.min_price_cents) {
            setError(`Your bid must be at least ₦${minK.toLocaleString()}.`);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        const result = await bidOnPostedJob(job.id, {
            service_id: selectedServiceId,
            proposed_price_cents: priceCents,
            message: message || undefined,
        });
        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error ?? "Failed to submit bid.");
            return;
        }
        setSuccess(true);
        qc.invalidateQueries({ queryKey: ["posted_jobs"] });
        setTimeout(onClose, 1800);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#C69C2E] to-[#e6b93a] p-6 text-white">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            <h2 className="font-bold text-lg">Apply for Job</h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-1">{job.title}</p>
                    <div className="mt-2 flex items-center gap-1 text-white/90 text-sm">
                        <span className="font-bold mr-1">₦</span>
                        <span>Budget: ₦{minK.toLocaleString()} – ₦{maxK.toLocaleString()}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {success ? (
                        <div className="flex flex-col items-center py-6 gap-3">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="font-bold text-gray-900">Bid Submitted!</p>
                            <p className="text-sm text-gray-500 text-center">The job poster will be notified of your bid.</p>
                        </div>
                    ) : (
                        <>
                            {/* Service Select */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Your Service <span className="text-red-500">*</span>
                                </label>
                                {isLoadingServices ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading your services...
                                    </div>
                                ) : !myServices || myServices.length === 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                                        You need to create at least one approved service before bidding.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedServiceId}
                                        onChange={(e) => setSelectedServiceId(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50"
                                    >
                                        <option value="">-- Choose a service --</option>
                                        {myServices.map((svc: MyService) => (
                                            <option key={svc.id} value={svc.id}>
                                                {svc.name} ({svc.type})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Bid Price (NGN) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₦</span>
                                    <input
                                        type="number"
                                        min={minK}
                                        max={maxK * 2}
                                        step="0.01"
                                        placeholder={`${minK} – ${maxK}`}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">Budget range: ₦{minK.toLocaleString()} – ₦{maxK.toLocaleString()}</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cover Message <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Explain why you're a great fit for this job..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50 resize-none"
                                />
                            </div>

                            {/* Point Deduction Notice for Service Provider */}
                            <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-start gap-2.5">
                                <Coins className="w-4 h-4 text-[#C69C2E] shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800">
                                    <span className="font-bold">1 DGE Point</span> is deducted from your balance once your bid is accepted by the job owner.
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !myServices || myServices.length === 0}
                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Bid"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
