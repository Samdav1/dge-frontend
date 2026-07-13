"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
    ShieldCheck,
    Wallet,
    Clock,
    CheckCircle2,
    AlertTriangle,
    X,
    FileText,
    Globe,
    Upload,
    ChevronDown,
    ChevronUp,
    Loader2,
    ExternalLink,
    Star
} from "lucide-react";
import {
    useMyOngoingJobs,
    useSubmitWork,
    useReleaseEscrow,
    useRefundEscrow,
    useDisputeEscrow
} from "@/features/my-jobs/hooks/useMyJobs";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";
import { EscrowStatus } from "@/types/marketplace";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function EscrowsPage() {
    const { data: session } = useSession();
    const { data: escrows, isLoading, error } = useMyOngoingJobs();

    // Accordion expand state
    const [expandedEscrowId, setExpandedEscrowId] = useState<string | null>(null);

    // Form/Modal states
    const [activeEscrow, setActiveEscrow] = useState<any | null>(null);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);

    // Submission inputs
    const [submitText, setSubmitText] = useState("");
    const [submitLinks, setSubmitLinks] = useState("");
    const [submitImage, setSubmitImage] = useState<File | null>(null);
    const [submitFile, setSubmitFile] = useState<File | null>(null);

    // Release/Approve inputs
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [releaseMessage, setReleaseMessage] = useState("");

    // Dispute inputs
    const [disputeMessage, setDisputeMessage] = useState("");

    // Mutations
    const submitWorkMutation = useSubmitWork();
    const releaseEscrowMutation = useReleaseEscrow();
    const refundEscrowMutation = useRefundEscrow();
    const disputeEscrowMutation = useDisputeEscrow();

    // Filter state
    const [filter, setFilter] = useState<"all" | "held" | "released" | "disputed" | "refunded">("all");

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#C69C2E] animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading escrows...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Failed to load Escrows</h2>
                <p className="text-gray-500 mt-2">Could not retrieve your active escrow contracts. Please try again later.</p>
            </div>
        );
    }

    const filteredEscrows = (escrows || []).filter((escrow: any) => {
        if (filter === "all") return true;
        return escrow.status === filter;
    });

    const handleSubmitWork = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeEscrow) return;

        const formData = new FormData();
        formData.append("escrow_id", activeEscrow.id);
        formData.append("service_id", activeEscrow.price_negotiation?.services?.id || "");
        formData.append("text", submitText);
        if (submitLinks) {
            formData.append("links", JSON.stringify(submitLinks.split(",").map(l => l.trim()).filter(Boolean)));
        }
        if (submitImage) {
            formData.append("image", submitImage);
        }
        if (submitFile) {
            formData.append("files", submitFile);
        }

        try {
            await submitWorkMutation.mutateAsync(formData);
            toast.success("Work submitted successfully!");
            setIsSubmitOpen(false);
            setSubmitText("");
            setSubmitLinks("");
            setSubmitImage(null);
            setSubmitFile(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to submit work");
        }
    };

    const handleReleaseEscrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeEscrow) return;

        try {
            await releaseEscrowMutation.mutateAsync({
                escrowId: activeEscrow.id,
                rating,
                review_comment: reviewComment,
                direct_message: releaseMessage
            });
            toast.success("Escrow payment approved and released!");
            setIsReleaseOpen(false);
            setReviewComment("");
            setReleaseMessage("");
        } catch (err: any) {
            toast.error(err.message || "Failed to release escrow");
        }
    };

    const handleRefundEscrow = async () => {
        if (!activeEscrow) return;

        try {
            await refundEscrowMutation.mutateAsync(activeEscrow.id);
            toast.success("Escrow payment refunded to client!");
            setIsRefundOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to refund escrow");
        }
    };

    const handleDisputeEscrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeEscrow) return;

        try {
            await disputeEscrowMutation.mutateAsync({
                escrowId: activeEscrow.id,
                direct_message: disputeMessage
            });
            toast.success("Escrow has been disputed for admin review.");
            setIsDisputeOpen(false);
            setDisputeMessage("");
        } catch (err: any) {
            toast.error(err.message || "Failed to dispute escrow");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#C69C2E]" />
                    Escrow Contracts
                </h1>
                <p className="text-gray-500 mt-2">
                    Secure and transparent payments between clients and service providers.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 overflow-x-auto pb-1">
                {(["all", "held", "released", "disputed", "refunded"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`text-sm font-bold pb-3 border-b-2 transition-all whitespace-nowrap ${
                            filter === tab
                                ? "border-[#C69C2E] text-gray-900 dark:text-white"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {tab === "all" ? "All Contracts" : tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {filteredEscrows.length === 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center">
                    <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Escrow Contracts Found</h3>
                    <p className="text-gray-400 mt-1">There are no active contracts under this filter tab.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEscrows.map((escrow: any) => {
                        const service = escrow.price_negotiation?.services;
                        const isProvider = session?.user?.id === escrow.payee_wallet?.user_id;
                        const otherUser = isProvider ? escrow.price_negotiation?.initiator : escrow.price_negotiation?.receiver;
                        const amount = escrow.amount_cents / 100;
                        const isExpanded = expandedEscrowId === escrow.id;

                        // Calculate stage number
                        let activeStage = 1;
                        if (escrow.status === EscrowStatus.held) {
                            activeStage = (escrow.submissions?.length || 0) > 0 ? 3 : 2;
                        } else if (escrow.status === EscrowStatus.released) {
                            activeStage = 4;
                        }

                        // Determine Next Steps guidance
                        let nextActionTitle = "";
                        let nextActionDesc = "";
                        if (escrow.status === EscrowStatus.held) {
                            if ((escrow.submissions?.length || 0) === 0) {
                                nextActionTitle = isProvider ? "Action Required: Start Working" : "Awaiting Deliverables";
                                nextActionDesc = isProvider
                                    ? "Please begin working on the agreed service. Once completed, upload your work/proof here for client review."
                                    : "The service provider is working. You will be notified once deliverables are uploaded.";
                            } else {
                                nextActionTitle = isProvider ? "Awaiting Review" : "Action Required: Review Deliverables";
                                nextActionDesc = isProvider
                                    ? "You have submitted your deliverables. The client is reviewing it to release your payout."
                                    : "The provider has submitted their work. Please review the details below. Approve to release funds, or request changes if unsatisfied.";
                            }
                        } else if (escrow.status === EscrowStatus.released) {
                            nextActionTitle = "Contract Completed";
                            nextActionDesc = "Funds have been released successfully. Thank you for using DGE Tech!";
                        } else if (escrow.status === EscrowStatus.refunded) {
                            nextActionTitle = "Contract Refunded";
                            nextActionDesc = "Funds have been fully returned to the client's wallet.";
                        } else if (escrow.status === EscrowStatus.disputed) {
                            nextActionTitle = "Contract Under Review";
                            nextActionDesc = "A dispute has been logged. Admin arbitration is currently reviewing deliverables and communications.";
                        }

                        return (
                            <div
                                key={escrow.id}
                                className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Main Banner Summary */}
                                <div
                                    onClick={() => setExpandedEscrowId(isExpanded ? null : escrow.id)}
                                    className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                                            <FallbackImage
                                                src={getBackendImageUrl(service?.image || "")}
                                                alt={service?.name || "Service Image"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white">{service?.name || "Service Agreement"}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                                                    isProvider ? "bg-green-50 text-green-700 dark:bg-green-950/20" : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                                                }`}>
                                                    {isProvider ? "Provider" : "Client"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Contract with <strong className="text-gray-700 dark:text-gray-300">{otherUser?.username || "Other User"}</strong>
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    escrow.status === "held" ? "bg-amber-100 text-amber-700" :
                                                    escrow.status === "released" ? "bg-green-100 text-green-700" :
                                                    escrow.status === "disputed" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {escrow.status}
                                                </span>
                                                {escrow.payment_method && (
                                                    <span className="text-[10px] text-gray-400 capitalize">
                                                        ({escrow.payment_method === "cash" ? "Offline Cash" : "Platform Escrow"})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                                        <div className="text-right">
                                            <span className="text-xs text-gray-400">Total Price</span>
                                            <p className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">₦{amount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded View Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 md:p-6 bg-slate-50/50 dark:bg-black/20 space-y-6">
                                        {/* Stages Workflow Progress Bar */}
                                        <div className="bg-white dark:bg-[#181818] p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Escrow Stage Flow</h4>
                                            
                                            <div className="grid grid-cols-4 gap-2 relative">
                                                {/* Connecting line */}
                                                <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
                                                <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-green-500 -z-10 transition-all duration-300" style={{
                                                    width: activeStage === 1 ? "0%" : activeStage === 2 ? "33%" : activeStage === 3 ? "66%" : "100%"
                                                }} />

                                                {/* Stage 1 */}
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        activeStage >= 1 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                                                    }`}>
                                                        1
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-700 dark:text-gray-300">Created</span>
                                                </div>

                                                {/* Stage 2 */}
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        activeStage >= 2 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                                                    }`}>
                                                        2
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-700 dark:text-gray-300">Funds Held</span>
                                                </div>

                                                {/* Stage 3 */}
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        activeStage >= 3 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                                                    }`}>
                                                        3
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-700 dark:text-gray-300">Submitted</span>
                                                </div>

                                                {/* Stage 4 */}
                                                <div className="flex flex-col items-center text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                        activeStage >= 4 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                                                    }`}>
                                                        4
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-2 text-gray-700 dark:text-gray-300">Completed</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* What to do Next guidance card */}
                                        <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/20 rounded-2xl p-4 flex gap-3">
                                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400">{nextActionTitle}</h4>
                                                <p className="text-xs text-amber-700/80 dark:text-amber-500 mt-1 leading-relaxed">
                                                    {nextActionDesc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Original details info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Original Proposal</h4>
                                                <h5 className="font-bold text-gray-900 dark:text-white">{service?.name}</h5>
                                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                                    {service?.description}
                                                </p>
                                            </div>

                                            <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contract Stakeholders</h4>
                                                    <div className="space-y-3 mt-3">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">Client Payer:</span>
                                                            <span className="font-bold text-gray-700 dark:text-gray-300">{escrow.payer_wallet?.username || "Client"}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">Service Provider:</span>
                                                            <span className="font-bold text-gray-700 dark:text-gray-300">{escrow.payee_wallet?.username || "Provider"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Core action triggers */}
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                                                    {isProvider && escrow.status === EscrowStatus.held && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveEscrow(escrow);
                                                                setIsSubmitOpen(true);
                                                            }}
                                                            disabled={(escrow.submissions?.length || 0) > 0}
                                                            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                 (escrow.submissions?.length || 0) > 0
                                     ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                     : "bg-[#C69C2E] hover:bg-[#b08b29] text-white"
                             }`}
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                            {(escrow.submissions?.length || 0) > 0 ? "Work Submitted" : "Submit Deliverables"}
                                                        </button>
                                                    )}

                                                    {!isProvider && escrow.status === EscrowStatus.held && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setActiveEscrow(escrow);
                                                                    setIsReleaseOpen(true);
                                                                }}
                                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Approve & Release
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setActiveEscrow(escrow);
                                                                    setIsDisputeOpen(true);
                                                                }}
                                                                className="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                                Dispute
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setActiveEscrow(escrow);
                                                                    setIsRefundOpen(true);
                                                                }}
                                                                className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                Refund
                                                            </button>
                                                        </>
                                                    )}

                                                    {escrow.status === EscrowStatus.released && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveEscrow(escrow);
                                                                setIsDisputeOpen(true);
                                                            }}
                                                            className="flex-1 border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                            Dispute Completed Escrow
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submissions Section */}
                                        {escrow.submissions && escrow.submissions.length > 0 && (
                                            <div className="bg-white dark:bg-[#181818] rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Submitted Deliverables</h3>
                                                <div className="space-y-4">
                                                    {escrow.submissions.map((sub: any) => (
                                                        <div key={sub.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3 bg-gray-50/50 dark:bg-black/10">
                                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                                <span>Submitted on {new Date(sub.created_at).toLocaleString()}</span>
                                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#C69C2E]/10 text-[#C69C2E] uppercase">
                                                                    Review Draft
                                                                </span>
                                                            </div>
                                                            {sub.text && (
                                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                    {sub.text}
                                                                </p>
                                                            )}
                                                            {sub.links && sub.links.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Resource Links</span>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {sub.links.map((link: string, lIdx: number) => (
                                                                            <a key={lIdx} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C69C2E] hover:underline flex items-center gap-1 font-semibold">
                                                                                <Globe className="w-3.5 h-3.5" />
                                                                                {link}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {((sub.image_urls && sub.image_urls.length > 0) || (sub.file_urls && sub.file_urls.length > 0)) && (
                                                                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Attached files</span>
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                        {sub.image_urls?.map((url: string, iIdx: number) => (
                                                                            <a key={iIdx} href={getBackendImageUrl(url)} target="_blank" rel="noopener noreferrer" className="relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 aspect-video">
                                                                                <FallbackImage src={getBackendImageUrl(url)} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                                                            </a>
                                                                        ))}
                                                                        {sub.file_urls?.map((url: string, fIdx: number) => (
                                                                            <a key={fIdx} href={getBackendImageUrl(url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[#121212]">
                                                                                <FileText className="w-5 h-5 text-gray-400" />
                                                                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate flex-1">Attachment file</span>
                                                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submit Deliverables Modal */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-[#121212] rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Submit Work Deliverables</DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Upload your completed project work, documentation, and external references to submit to the client.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitWork} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Submission Description</label>
                            <Textarea
                                required
                                value={submitText}
                                onChange={(e) => setSubmitText(e.target.value)}
                                placeholder="Describe what you completed, any notes for the client, etc."
                                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Project Links (comma separated)</label>
                            <Input
                                value={submitLinks}
                                onChange={(e) => setSubmitLinks(e.target.value)}
                                placeholder="https://github.com/..., https://livewebsite.com"
                                className="rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Attach Image</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSubmitImage(e.target.files?.[0] || null)}
                                    className="rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Attach Document/Zip</label>
                                <Input
                                    type="file"
                                    onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                                    className="rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSubmitOpen(false)}
                                className="rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitWorkMutation.isPending}
                                className="bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-xl text-xs font-bold"
                            >
                                {submitWorkMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        Submitting...
                                    </>
                                ) : "Submit Deliverables"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Approve & Release Escrow Modal */}
            <Dialog open={isReleaseOpen} onOpenChange={setIsReleaseOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-[#121212] rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Approve & Release Payment</DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Confirm that you are fully satisfied with the work. This action is final and will transfer funds from escrow directly to the provider's wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReleaseEscrow} className="space-y-4 py-2">
                        <div className="space-y-1 flex flex-col items-center justify-center pb-2">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Rate the Provider</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${star <= rating ? "fill-[#C69C2E] text-[#C69C2E]" : "text-gray-200"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Review Comments</label>
                            <Textarea
                                required
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Describe your experience working with this provider..."
                                className="min-h-[80px] rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Confirmation Message (Optional)</label>
                            <Input
                                value={releaseMessage}
                                onChange={(e) => setReleaseMessage(e.target.value)}
                                placeholder="Add an optional release note..."
                                className="rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850"
                            />
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsReleaseOpen(false)}
                                className="rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={releaseEscrowMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold"
                            >
                                {releaseEscrowMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        Releasing...
                                    </>
                                ) : "Approve & Release"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dispute Escrow Modal */}
            <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-[#121212] rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Dispute Contract
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Open an official dispute. An administrator will arbitrate the contract details, deliverables, and chat logs.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDisputeEscrow} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Reason for Dispute</label>
                            <Textarea
                                required
                                value={disputeMessage}
                                onChange={(e) => setDisputeMessage(e.target.value)}
                                placeholder="Explain in detail why you are raising a dispute..."
                                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-850"
                            />
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDisputeOpen(false)}
                                className="rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={disputeEscrowMutation.isPending}
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
                            >
                                {disputeEscrowMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                        Filing Dispute...
                                    </>
                                ) : "File Dispute"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Refund Escrow Modal */}
            <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-[#121212] rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <X className="w-5 h-5 text-red-600" />
                            Request Refund
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Confirm that you wish to request a full refund of this contract. This will release the funds back to the client's wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Are you sure you want to request a full refund? If the provider disputes this, it may require admin arbitration.
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsRefundOpen(false)}
                            className="rounded-xl text-xs font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRefundEscrow}
                            disabled={refundEscrowMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                        >
                            {refundEscrowMutation.isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                    Refunding...
                                </>
                            ) : "Confirm Refund"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
