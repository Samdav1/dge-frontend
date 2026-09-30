"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Clock, User, FileText, ArrowRight, Tag, Loader2 } from "lucide-react";
import { AcceptNegotiationModal } from "./AcceptNegotiationModal";
import { RejectNegotiationModal } from "./RejectNegotiationModal";
import { useRouter } from "next/navigation";
import { acceptNegotiation, rejectNegotiation, counterNegotiation } from "../actions";
import { createConversation, addParticipant, getCurrentUserId } from "../../inbox/actions";
import { onMarketplaceNegotiationAccepted, onMarketplaceNegotiationFailed } from "@/features/points/services/pointRules";

interface NegotiationCardProps {
    id: string;
    type: "outgoing" | "incoming";
    title: string;
    description: string;
    price: string;
    status: string;
    date: string;
    owner?: string;
    initiator_id: string;
    receiver_id: string;
    onStatusChange?: () => void;
    payment_method?: string;
    isBuyer?: boolean;
}

export function NegotiationCard({
    id,
    type,
    title,
    description,
    price,
    status,
    date,
    owner,
    initiator_id,
    receiver_id,
    onStatusChange,
    payment_method,
    isBuyer: propIsBuyer,
}: NegotiationCardProps) {
    const isBuyer = propIsBuyer ?? (type === "outgoing");
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isCounterOpen, setIsCounterOpen] = useState(false);
    const [counterPrice, setCounterPrice] = useState("");
    const [counterMessage, setCounterMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);
    const [rejectError, setRejectError] = useState<string | null>(null);
    const router = useRouter();

    const handleAcceptModalChange = (open: boolean) => {
        setIsAcceptModalOpen(open);
        if (!open) {
            setAcceptError(null);
        }
    };

    const handleRejectModalChange = (open: boolean) => {
        setIsRejectModalOpen(open);
        if (!open) {
            setRejectError(null);
        }
    };

    const handleChat = async () => {
        setIsLoading(true);
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) {
                console.error("User not logged in");
                return;
            }

            const otherUserId = type === "incoming" ? initiator_id : receiver_id;

            const conversationResult = await createConversation({
                type: "private",
                recipient_id: otherUserId,
                metadataInfo: {
                    negotiation_id: id,
                    type: "negotiation_chat"
                }
            });

            if (!conversationResult.success || !conversationResult.data) {
                console.error("Failed to create conversation:", conversationResult.error);
                return;
            }

            const conversationId = conversationResult.data.id;

            const addParticipantResult = await addParticipant({
                conversation_id: conversationId,
                user_id: otherUserId,
                role: "member"
            });

            if (!addParticipantResult.success) {
                console.error("Failed to add participant:", addParticipantResult.error);
            }

            router.push(`/dashboard/inbox?conversationId=${conversationId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (paymentMethod?: string) => {
        setIsLoading(true);
        setAcceptError(null);
        try {
            const result = await acceptNegotiation(id, paymentMethod);
            if (result.success) {
                await onMarketplaceNegotiationAccepted(isBuyer, id);
                setIsAcceptModalOpen(false);
                if (onStatusChange) {
                    onStatusChange();
                } else {
                    router.refresh();
                }
            } else {
                console.error("Failed to accept negotiation:", result.error);
                setAcceptError(result.error || "Failed to accept negotiation");
            }
        } catch (error: any) {
            console.error("Error accepting negotiation:", error);
            setAcceptError(error?.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        setRejectError(null);
        try {
            const result = await rejectNegotiation(id);
            if (result.success) {
                await onMarketplaceNegotiationFailed(isBuyer);
                setIsRejectModalOpen(false);
                if (onStatusChange) {
                    onStatusChange();
                } else {
                    router.refresh();
                }
            } else {
                console.error("Failed to reject negotiation:", result.error);
                setRejectError(result.error || "Failed to reject negotiation");
            }
        } catch (error: any) {
            console.error("Error rejecting negotiation:", error);
            setRejectError(error?.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCounterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!counterPrice || isNaN(Number(counterPrice))) return;

        setIsLoading(true);
        try {
            const priceInCents = Math.round(Number(counterPrice) * 100);
            const result = await counterNegotiation(id, priceInCents, counterMessage);
            if (result.success) {
                setIsCounterOpen(false);
                setCounterPrice("");
                setCounterMessage("");
                if (onStatusChange) {
                    onStatusChange();
                } else {
                    router.refresh();
                }
            } else {
                console.error("Failed to submit counter offer:", result.error);
            }
        } catch (error) {
            console.error("Error submitting counter offer:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isPending = status.toLowerCase() === "pending";
    const isCountered = status.toLowerCase() === "countered";
    const isAccepted = status.toLowerCase() === "accepted";
    const isRejected = status.toLowerCase() === "rejected";

    // Dynamic accent styles based on status
    const getStatusStyles = () => {
        if (isAccepted) return {
            border: "border-l-4 border-l-emerald-500",
            bg: "bg-emerald-500/10",
            text: "text-emerald-500 dark:text-emerald-400",
            glow: "shadow-emerald-500/5",
            dot: "bg-emerald-500"
        };
        if (isRejected) return {
            border: "border-l-4 border-l-red-500",
            bg: "bg-red-500/10",
            text: "text-red-500 dark:text-red-400",
            glow: "shadow-red-500/5",
            dot: "bg-red-500"
        };
        if (isCountered) return {
            border: "border-l-4 border-l-orange-500",
            bg: "bg-orange-500/10",
            text: "text-orange-500 dark:text-orange-400",
            glow: "shadow-orange-500/5",
            dot: "bg-orange-500"
        };
        return {
            border: "border-l-4 border-l-[#C69C2E]",
            bg: "bg-[#C69C2E]/10",
            text: "text-[#C69C2E]",
            glow: "shadow-[#C69C2E]/5",
            dot: "bg-[#C69C2E]"
        };
    };

    const statusStyle = getStatusStyles();

    return (
        <>
            <div className={`bg-white dark:bg-[#141414] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/30 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 overflow-hidden ${statusStyle.border} ${statusStyle.glow} flex flex-col justify-between group`}>
                
                {/* Upper Body */}
                <div className="p-6 md:p-8 space-y-6">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#C69C2E] bg-[#C69C2E]/10 px-2.5 py-1 rounded-md">
                                {type === "incoming" ? "Incoming Offer" : "Outgoing Proposal"}
                            </span>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white pt-1">{title}</h3>
                        </div>

                        {/* Status badge with pulsing indicator */}
                        <div className="flex flex-col items-end gap-1.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-pulse shrink-0`} />
                                <span className="capitalize">{status}</span>
                            </div>
                            {payment_method && (
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-200/50 dark:border-gray-700/50">
                                    Method: {payment_method === "cash" ? "Cash" : "Platform"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Deal Value Presentation */}
                    <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#252525] rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C69C2E]/20 to-[#8d6d1d]/20 border border-[#C69C2E]/30 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-[#C69C2E]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Proposed Price</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{price}</p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400 dark:text-gray-500 font-mono">
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            {date}
                        </div>
                    </div>

                    {/* Proposal Message */}
                    <div className="relative p-4 rounded-2xl bg-gray-50/50 dark:bg-[#1B1B1B]/50 border border-gray-100/50 dark:border-[#222] italic text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="absolute top-3.5 right-3.5 w-4 h-4 opacity-10" />
                        <p className="line-clamp-3">"{description}"</p>
                    </div>

                    {/* Meta information */}
                    {owner && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-[#222] pt-4">
                            <User className="w-3.5 h-3.5 text-[#C69C2E]" />
                            <span>Client / Employer: <strong className="text-gray-900 dark:text-white font-semibold">{owner}</strong></span>
                        </div>
                    )}
                </div>

                {/* Bottom Row / Actions */}
                <div className="border-t border-gray-100 dark:border-[#252525] bg-gray-50/50 dark:bg-[#1B1B1B]/30 px-6 py-4 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                        {type === "incoming" && isPending ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAcceptModalOpen(true)}
                                    className="flex-1 sm:flex-none border-emerald-500/40 text-emerald-500 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 font-bold h-10 rounded-xl gap-1.5 px-4 text-xs transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    <Check className="w-4 h-4" />
                                    Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCounterOpen(!isCounterOpen)}
                                    className={`flex-1 sm:flex-none font-bold h-10 rounded-xl gap-1.5 px-4 text-xs transition-all duration-300 ${
                                        isCounterOpen 
                                        ? "bg-[#C69C2E] text-black border-[#C69C2E]" 
                                        : "border-[#C69C2E]/40 text-[#C69C2E] hover:bg-[#C69C2E] hover:text-black hover:border-[#C69C2E]"
                                    }`}
                                    disabled={isLoading}
                                >
                                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isCounterOpen ? 'rotate-90' : ''}`} />
                                    Counter
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRejectModalOpen(true)}
                                    className="flex-1 sm:flex-none border-red-500/40 text-red-500 hover:bg-red-500 hover:text-black hover:border-red-500 font-bold h-10 rounded-xl gap-1.5 px-4 text-xs transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </Button>
                            </div>
                        ) : null}

                        <Button
                            className="w-full sm:w-auto bg-[#C69C2E] hover:bg-[#b08b29] text-black font-extrabold h-10 rounded-xl gap-1.5 px-5 text-xs ml-auto shadow-md shadow-[#C69C2E]/10"
                            onClick={handleChat}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <MessageSquare className="w-4 h-4" />
                            )}
                            Chat Negotiator
                        </Button>
                    </div>

                    {/* Inline Counter Offer Input Collapsible Panel */}
                    {isCounterOpen && (
                        <form onSubmit={handleCounterSubmit} className="border-t border-gray-100 dark:border-[#252525] pt-4 space-y-4 animate-in slide-in-from-top duration-300">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Counter Price (NGN)</label>
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A]">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#C69C2E]">₦</span>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 45000"
                                        value={counterPrice}
                                        onChange={(e) => setCounterPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Counter Message / Reason</label>
                                <textarea
                                    rows={2}
                                    placeholder="Write a brief message explaining your counter offer..."
                                    value={counterMessage}
                                    onChange={(e) => setCounterMessage(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2E2E2E] rounded-xl text-xs text-gray-900 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-2 w-full pt-1">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-[#C69C2E] to-[#a37e20] text-black font-extrabold h-9 rounded-xl text-xs active:scale-95 shadow-md shadow-[#C69C2E]/10"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Counter Offer"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCounterOpen(false);
                                        setCounterPrice("");
                                        setCounterMessage("");
                                    }}
                                    className="border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400 h-9 rounded-xl text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <AcceptNegotiationModal
                open={isAcceptModalOpen}
                onOpenChange={handleAcceptModalChange}
                onAccept={handleAccept}
                isBuyer={isBuyer}
                isLoading={isLoading}
                error={acceptError}
            />

            <RejectNegotiationModal
                open={isRejectModalOpen}
                onOpenChange={handleRejectModalChange}
                onReject={handleReject}
                isLoading={isLoading}
                error={rejectError}
            />
        </>
    );
}
