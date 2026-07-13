"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Globe, Mail, Loader2, CheckCircle2, FileText, ExternalLink, User, Clock } from "lucide-react";
import { useWorkSubmissionDetails, useOngoingJobDetails } from "../hooks/useMyJobs";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";

import { releaseEscrow, disputeEscrow } from "../../escrow/actions";
import { createConversation } from "../../inbox/actions";
import { EscrowActionModal } from "./EscrowActionModal";
import { useRouter } from "next/navigation";

export function SubmittedJobDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { data: submission, isLoading: isSubLoading, error: subError } = useWorkSubmissionDetails(id as string);
    
    // Once we have submission, we can get escrow details to know who the participants are
    const { data: escrow, isLoading: isEscrowLoading } = useOngoingJobDetails(submission?.escrow_id || "");

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject">("approve");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isMessageLoading, setIsMessageLoading] = useState(false);

    const handleMessageUser = async () => {
        if (!escrow || !otherUser?.id) return;
        setIsMessageLoading(true);
        try {
            const result = await createConversation({
                type: "private",
                recipient_id: otherUser.id
            });
            if (!result.success) throw new Error(result.error);
            router.push(`/dashboard/inbox`);
        } catch (err) {
            console.error("Failed to start conversation:", err);
            // Optionally could add a toast here
        } finally {
            setIsMessageLoading(false);
        }
    };

    const handleActionSubmit = async (payload: { rating?: number; review_comment?: string; direct_message?: string }) => {
        if (!escrow?.id) return;
        setIsActionLoading(true);
        try {
            let result;
            if (actionType === "approve") {
                result = await releaseEscrow(escrow.id, payload);
            } else {
                result = await disputeEscrow(escrow.id, payload);
            }

            if (!result.success) {
                throw new Error(result.error);
            }

            // Success, close modal and maybe refresh
            setIsActionModalOpen(false);
            window.location.reload(); // Quick way to refresh data
        } finally {
            setIsActionLoading(false);
        }
    };

    const isLoading = isSubLoading || isEscrowLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#C69C2E] animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading submission details...</p>
            </div>
        );
    }

    if (subError || !submission) {
        return (
            <div className="p-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Error loading submission</h2>
                <p className="text-gray-500 mt-2">The submission details could not be retrieved.</p>
                <Link href="/dashboard/my-jobs" className="mt-6 text-[#C69C2E] font-bold hover:underline">
                    Back to My Jobs
                </Link>
            </div>
        );
    }

    const service = submission.service;
    const isProvider = session?.user?.id === escrow?.payee_wallet?.user_id;
    const otherUser = isProvider ? escrow?.price_negotiation?.initiator : escrow?.price_negotiation?.receiver;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <Link
                    href="/dashboard/my-jobs"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Submission Details</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isProvider ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>
                            {isProvider ? "Service Provider" : "Client"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isProvider ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        }`}>
                            {isProvider ? "Submitted by Me" : "For My Approval"}
                        </span>
                    </div>
                </div>
                <div className="ml-auto text-xs md:text-sm text-gray-500 hidden md:block">
                    <Link href="/dashboard" className="hover:text-gray-900">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/my-jobs" className="hover:text-gray-900">My job</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#C69C2E]">Submission</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column - Main Info */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div className="relative h-[250px] md:h-[350px] rounded-xl overflow-hidden mb-6 bg-gray-50">
                            <FallbackImage
                                src={getBackendImageUrl(service?.image)}
                                alt={service?.name || "Job Image"}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{service?.name}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl md:text-2xl font-bold text-[#C69C2E]">
                                    ₦{(escrow?.amount_cents ? escrow.amount_cents / 100 : 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Submission Content */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#C69C2E]" />
                                    Submission Message
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
                                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {submission.text || "No submission message provided."}
                                    </p>
                                </div>
                            </div>

                            {submission.links && submission.links.length > 0 && (
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <ExternalLink className="w-5 h-5 text-[#C69C2E]" />
                                        Attached Links
                                    </h3>
                                    <div className="space-y-2">
                                        {submission.links.map((link: string, idx: number) => (
                                            <a 
                                                key={idx}
                                                href={link.startsWith('http') ? link : `https://${link}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-[#C69C2E] hover:bg-gray-50 transition-all group"
                                            >
                                                <Globe className="w-4 h-4 text-gray-400 group-hover:text-[#C69C2E]" />
                                                <span className="text-sm text-gray-600 truncate flex-grow font-medium">{link}</span>
                                                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#C69C2E]" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {submission.file_urls && submission.file_urls.length > 0 && (
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Delivered Files</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {submission.file_urls.map((url: string, idx: number) => (
                                            <a 
                                                key={idx}
                                                href={getBackendImageUrl(url)} 
                                                download 
                                                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-blue-900 truncate">Download File {idx + 1}</p>
                                                    <p className="text-[10px] text-blue-500 uppercase font-bold">Attachment</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <span>Submitted on: {new Date(submission.created_at).toLocaleString()}</span>
                            <span>Submission ID: {submission.id}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - User Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">
                            {isProvider ? "Client Info" : "Provider Info"}
                        </h4>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-50 flex items-center justify-center">
                                {otherUser?.username ? (
                                    <span className="text-[#C69C2E] font-bold text-lg">{otherUser.username.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <User className="w-6 h-6 text-gray-300" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{otherUser?.username || "Anonymous User"}</h3>
                                <p className="text-xs text-gray-500">{otherUser?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#C69C2E]/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-[#C69C2E]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 uppercase">EMAIL ADDRESS</p>
                                    <p className="text-sm text-gray-900 font-medium truncate">{otherUser?.email || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            {!isProvider && escrow && escrow.status !== "released" && escrow.status !== "disputed" && escrow.status !== "refunded" && (
                                <div className="space-y-3 mb-3">
                                    <button 
                                        onClick={() => {
                                            setActionType("approve");
                                            setIsActionModalOpen(true);
                                        }}
                                        className="w-full bg-[#C69C2E] text-white py-3 rounded-xl font-bold hover:bg-[#b08b29] transition-colors"
                                    >
                                        {escrow.payment_method === "cash" ? "Confirm Satisfaction" : "Approve & Release Payment"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActionType("reject");
                                            setIsActionModalOpen(true);
                                        }}
                                        className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Reject / Request Revision
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={handleMessageUser}
                                disabled={isMessageLoading || !otherUser?.id}
                                className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isMessageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Message {otherUser?.username || "User"}
                            </button>
                        </div>
                    </div>
                    
                    {/* Status Box */}
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <h4 className="font-bold text-orange-900">
                                {escrow?.status === "released" ? (escrow.payment_method === "cash" ? "Satisfaction Confirmed" : "Payment Released") : 
                                 escrow?.status === "disputed" ? "In Dispute" : 
                                 escrow?.status === "refunded" ? "Payment Refunded" : 
                                 "Waiting for Approval"}
                            </h4>
                        </div>
                        <p className="text-xs text-orange-700 leading-relaxed">
                            {escrow?.status === "released" ? (escrow.payment_method === "cash" ? "You have confirmed satisfaction with this job." : "This submission has been approved and the payment was successfully released.") :
                             escrow?.status === "disputed" ? "This submission has been rejected and is currently under dispute/revision." :
                             escrow?.status === "refunded" ? "This payment has been refunded to the client." :
                             isProvider 
                                ? (escrow?.payment_method === "cash" ? "Your work has been submitted. The client needs to confirm satisfaction." : "Your work has been submitted. The client needs to review and release the payment from escrow.") 
                                : (escrow?.payment_method === "cash" ? "The provider has submitted the work. Please review it and confirm satisfaction." : "The provider has submitted the work. Please review it and release the payment if satisfied.")}
                        </p>
                    </div>
                </div>
            </div>

            <EscrowActionModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                actionType={actionType}
                onSubmit={handleActionSubmit}
                isLoading={isActionLoading}
            />
        </div>
    );
}
