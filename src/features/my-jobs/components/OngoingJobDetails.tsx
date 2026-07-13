"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    Globe,
    Mail,
    Loader2,
    CheckCircle2,
    Clock,
    FileText,
    Wallet,
    Upload,
    AlertTriangle,
    X,
    Star,
    ExternalLink
} from "lucide-react";
import {
    useOngoingJobDetails,
    useSubmitWork,
    useReleaseEscrow,
    useRefundEscrow,
    useDisputeEscrow
} from "../hooks/useMyJobs";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";
import { EscrowStatus } from "@/types/marketplace";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function OngoingJobDetails() {
    const { id } = useParams();
    const { data: session } = useSession();
    const { data: escrow, isLoading, error } = useOngoingJobDetails(id as string);

    // Form/Modal states
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#C69C2E] animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading job details...</p>
            </div>
        );
    }

    if (error || !escrow) {
        return (
            <div className="p-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Error loading job</h2>
                <p className="text-gray-500 mt-2">The job details could not be retrieved. It might have been deleted or you don't have access.</p>
                <Link href="/dashboard/my-jobs" className="mt-6 text-[#C69C2E] font-bold hover:underline">
                    Back to My Jobs
                </Link>
            </div>
        );
    }

    const service = escrow.price_negotiation?.services;
    const isProvider = session?.user?.id === escrow.payee_wallet?.user_id;
    const otherUser = isProvider ? escrow.price_negotiation?.initiator : escrow.price_negotiation?.receiver;

    const statusSteps = [
        { label: "Job Created", icon: <FileText className="w-4 h-4" />, completed: true, date: escrow.created_at },
        { label: escrow.payment_method === "cash" ? "Cash Agreement Started" : "Payment Held", icon: <Wallet className="w-4 h-4" />, completed: escrow.status === EscrowStatus.held || escrow.status === EscrowStatus.released, date: escrow.created_at },
        { label: "Work Submitted", icon: <Clock className="w-4 h-4" />, completed: (escrow.submissions?.length || 0) > 0 || escrow.status === EscrowStatus.released, date: escrow.submissions?.[0]?.created_at },
        { label: escrow.payment_method === "cash" ? "Satisfaction Confirmed" : "Job Completed", icon: <CheckCircle2 className="w-4 h-4" />, completed: escrow.status === EscrowStatus.released, date: escrow.status === EscrowStatus.released ? escrow.updated_at : null },
    ];

    const handleSubmitWork = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("escrow_id", escrow.id);
        formData.append("service_id", service?.id || "");
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
        try {
            await releaseEscrowMutation.mutateAsync({
                escrowId: escrow.id,
                rating,
                review_comment: reviewComment,
                direct_message: releaseMessage
            });
            toast.success("Payment released successfully!");
            setIsReleaseOpen(false);
            setReviewComment("");
            setReleaseMessage("");
        } catch (err: any) {
            toast.error(err.message || "Failed to release escrow");
        }
    };

    const handleRefundEscrow = async () => {
        try {
            await refundEscrowMutation.mutateAsync(escrow.id);
            toast.success("Escrow payment refunded to client!");
            setIsRefundOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to refund escrow");
        }
    };

    const handleDisputeEscrow = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await disputeEscrowMutation.mutateAsync({
                escrowId: escrow.id,
                direct_message: disputeMessage
            });
            toast.success("Dispute filed successfully.");
            setIsDisputeOpen(false);
            setDisputeMessage("");
        } catch (err: any) {
            toast.error(err.message || "Failed to dispute escrow");
        }
    };

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
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Job Details</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isProvider ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>
                            {isProvider ? "Service Provider" : "Client"}
                        </span>
                    </div>
                </div>
                <div className="ml-auto text-xs md:text-sm text-gray-500 hidden md:block">
                    <Link href="/dashboard" className="hover:text-gray-900">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/dashboard/my-jobs" className="hover:text-gray-900">My job</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#C69C2E]">Details</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column - Main Info */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div className="relative h-[250px] md:h-[400px] rounded-xl overflow-hidden mb-6">
                            <FallbackImage
                                src={getBackendImageUrl(service?.image || "")}
                                alt={service?.name || "Job Image"}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{service?.name}</h2>
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                                    {service?.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl md:text-2xl font-bold text-gray-900">₦{(escrow.amount_cents / 100).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h3 className="text-base md:text-lg font-bold text-gray-900">Job Description:</h3>
                            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                                {service?.description}
                            </p>
                        </div>

                        {/* Timeline */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-6">Job Timeline</h3>
                            <div className="relative flex flex-col gap-6">
                                {statusSteps.map((step, index) => (
                                    <div key={index} className="flex gap-4 relative">
                                        {index !== statusSteps.length - 1 && (
                                            <div className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${step.completed && statusSteps[index+1].completed ? "bg-green-500" : "bg-gray-100"}`} />
                                        )}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                            step.completed ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                                        }`}>
                                            {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm md:text-base ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                                                {step.label}
                                            </p>
                                            {step.date && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(step.date).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">
                                Current Status: <span className="text-[#C69C2E]">{escrow.status.toUpperCase()}</span>
                            </p>
                            {escrow.payment_method && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Payment Method: <strong className="text-gray-700 dark:text-gray-300 capitalize">{escrow.payment_method === "cash" ? "Offline Cash" : "Platform Escrow"}</strong>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submissions Section */}
                    {escrow.submissions && escrow.submissions.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Submitted Work/Deliverables</h3>
                            <div className="space-y-4">
                                {escrow.submissions.map((sub: any) => (
                                    <div key={sub.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>Submitted on {new Date(sub.created_at).toLocaleString()}</span>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#C69C2E]/10 text-[#C69C2E] uppercase">
                                                Review Draft
                                            </span>
                                        </div>
                                        {sub.text && (
                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                {sub.text}
                                            </p>
                                        )}
                                        {sub.links && sub.links.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Project Links</span>
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
                                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Attachments</span>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {sub.image_urls?.map((url: string, iIdx: number) => (
                                                        <a key={iIdx} href={getBackendImageUrl(url)} target="_blank" rel="noopener noreferrer" className="relative group block rounded-lg overflow-hidden border border-gray-200 aspect-video">
                                                            <FallbackImage src={getBackendImageUrl(url)} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                                        </a>
                                                    ))}
                                                    {sub.file_urls?.map((url: string, fIdx: number) => (
                                                        <a key={fIdx} href={getBackendImageUrl(url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-white transition-colors bg-white">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <span className="text-xs text-gray-600 font-medium truncate flex-1">Attachment File</span>
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

                {/* Right Column - Contact & Action Buttons */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">
                            {isProvider ? "Client Information" : "Service Provider"}
                        </h4>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-50 flex items-center justify-center">
                                {otherUser?.username ? (
                                    <span className="text-[#C69C2E] font-bold text-lg">{otherUser.username.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <Globe className="w-6 h-6 text-gray-300" />
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
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">EMAIL ADDRESS</p>
                                    <p className="text-sm text-gray-900 font-medium break-all">{otherUser?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Buttons based on Role & State */}
                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                            {isProvider && escrow.status === EscrowStatus.held && (
                                <button
                                    onClick={() => setIsSubmitOpen(true)}
                                    disabled={(escrow.submissions?.length || 0) > 0}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                        (escrow.submissions?.length || 0) > 0
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                            : "bg-[#C69C2E] hover:bg-[#b08b29] text-white"
                                    }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    {(escrow.submissions?.length || 0) > 0 ? "Work Submitted (Pending Review)" : "Submit Deliverables"}
                                </button>
                            )}

                            {!isProvider && escrow.status === EscrowStatus.held && (
                                <>
                                    <button
                                        onClick={() => setIsReleaseOpen(true)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Approve & Release Payment
                                    </button>
                                    <button
                                        onClick={() => setIsDisputeOpen(true)}
                                        className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Dispute Contract
                                    </button>
                                    <button
                                        onClick={() => setIsRefundOpen(true)}
                                        className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Request Refund
                                    </button>
                                </>
                            )}

                            {escrow.status === EscrowStatus.released && (
                                <button
                                    onClick={() => setIsDisputeOpen(true)}
                                    className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Dispute Contract (Completed/Released)
                                </button>
                            )}

                            <Link href={`/dashboard/marketplace/service/${service?.id}`} className="block">
                                <button className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                    View Service Original
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Deliverables Modal */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="max-w-md bg-white rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Submit Work Deliverables</DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Upload your completed project work, documentation, and external references to submit to the client.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitWork} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Submission Description</label>
                            <Textarea
                                required
                                value={submitText}
                                onChange={(e) => setSubmitText(e.target.value)}
                                placeholder="Describe what you completed, any notes for the client, etc."
                                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Project Links (comma separated)</label>
                            <Input
                                value={submitLinks}
                                onChange={(e) => setSubmitLinks(e.target.value)}
                                placeholder="https://github.com/..., https://livewebsite.com"
                                className="rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Attach Image</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSubmitImage(e.target.files?.[0] || null)}
                                    className="rounded-xl bg-gray-50 border-gray-100 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Attach Document/Zip</label>
                                <Input
                                    type="file"
                                    onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                                    className="rounded-xl bg-gray-50 border-gray-100 text-xs"
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
                <DialogContent className="max-w-md bg-white rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Approve & Release Payment</DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Confirm that you are fully satisfied with the work. This action is final and will transfer funds from escrow directly to the provider's wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReleaseEscrow} className="space-y-4 py-2">
                        <div className="space-y-1 flex flex-col items-center justify-center pb-2">
                            <label className="text-xs font-bold text-gray-600 mb-1">Rate the Provider</label>
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
                            <label className="text-xs font-bold text-gray-600">Review Comments</label>
                            <Textarea
                                required
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Describe your experience working with this provider..."
                                className="min-h-[80px] rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Confirmation Message (Optional)</label>
                            <Input
                                value={releaseMessage}
                                onChange={(e) => setReleaseMessage(e.target.value)}
                                placeholder="Add an optional release note..."
                                className="rounded-xl bg-gray-50 border-gray-100"
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
                <DialogContent className="max-w-md bg-white rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Dispute Contract
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Open an official dispute. An administrator will arbitrate the contract details, deliverables, and chat logs.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDisputeEscrow} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Reason for Dispute</label>
                            <Textarea
                                required
                                value={disputeMessage}
                                onChange={(e) => setDisputeMessage(e.target.value)}
                                placeholder="Explain in detail why you are raising a dispute..."
                                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-100"
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
                <DialogContent className="max-w-md bg-white rounded-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <X className="w-5 h-5 text-red-600" />
                            Request Refund
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Confirm that you wish to request a full refund of this contract. This will release the funds back to the client's wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
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
