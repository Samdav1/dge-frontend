"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2, TrendingUp, ArrowDownLeft, CheckCircle2, Coins, Sparkles } from "lucide-react";
import { NegotiationCard } from "./NegotiationCard";
import { getMyNegotiations } from "../actions";
import { useChatContext } from "@/providers/ChatProvider";

interface Negotiation {
    id: string;
    service_id: string;
    initiator_id: string;
    receiver_id: string;
    negotiation_type: "incoming" | "outgoing";
    proposed_price_cents: number;
    message?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export function NegotiationList() {
    const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNegotiations = async () => {
        setLoading(true);
        const result = await getMyNegotiations();
        if (result.success) {
            const uniqueNegotiations = Array.from(
                new Map((result.data || []).map((item: Negotiation) => [item.id, item])).values()
            ) as Negotiation[];
            setNegotiations(uniqueNegotiations);
        } else {
            setError(result.error || "Failed to fetch negotiations");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNegotiations();
    }, []);

    const { latestNegotiationUpdate } = useChatContext();

    useEffect(() => {
        if (latestNegotiationUpdate) {
            fetchNegotiations();
        }
    }, [latestNegotiationUpdate]);

    const currentData = negotiations.filter(n => n.negotiation_type === activeTab);

    // Calculate Stats
    const pendingIncoming = negotiations.filter(n => n.negotiation_type === "incoming" && n.status.toLowerCase() === "pending").length;
    const pendingOutgoing = negotiations.filter(n => n.negotiation_type === "outgoing" && n.status.toLowerCase() === "pending").length;
    const acceptedCount = negotiations.filter(n => n.status.toLowerCase() === "accepted").length;
    const pendingValue = negotiations.filter(n => n.status.toLowerCase() === "pending").reduce((sum, n) => sum + n.proposed_price_cents, 0) / 100;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(amount);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-8 md:py-20 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
                <p className="text-red-500 text-center mb-4">{error}</p>
                <Button onClick={fetchNegotiations} variant="outline" className="border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* High-Fidelity Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Active Deal Volume */}
                <div className="relative overflow-hidden bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#C69C2E]/5 dark:bg-[#C69C2E]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Proposals Value</span>
                        <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-[#C69C2E]" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">
                        {formatCurrency(pendingValue)}
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span>Negotiating {pendingIncoming + pendingOutgoing} live contracts</span>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="relative overflow-hidden bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pending Incoming</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {pendingIncoming} <span className="text-xs font-medium text-gray-400">offers</span>
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Requires your direct response</span>
                    </div>
                </div>

                {/* Successful Deals */}
                <div className="relative overflow-hidden bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Completed Deals</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {acceptedCount} <span className="text-xs font-medium text-gray-400">accepted</span>
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 dark:text-emerald-400">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>Contracts finalized successfully</span>
                    </div>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Modern Pill Toggle Tabs */}
                <div className="flex gap-1.5 w-full md:w-auto bg-gray-50 dark:bg-[#1C1C1C] p-1.5 rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
                    <button
                        onClick={() => setActiveTab("outgoing")}
                        className={`flex-1 md:flex-none md:min-w-[160px] px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${activeTab === "outgoing"
                            ? "bg-[#C69C2E] text-black shadow-lg shadow-[#C69C2E]/10 scale-[1.02]"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Outgoing Proposals
                    </button>
                    <button
                        onClick={() => setActiveTab("incoming")}
                        className={`flex-1 md:flex-none md:min-w-[160px] px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${activeTab === "incoming"
                            ? "bg-[#C69C2E] text-black shadow-lg shadow-[#C69C2E]/10 scale-[1.02]"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Incoming Offers
                    </button>
                </div>

                <Button
                    className="bg-gradient-to-r from-[#C69C2E] to-[#a37e20] text-black hover:brightness-105 font-extrabold rounded-xl px-6 w-full md:w-auto h-11 shadow-lg shadow-[#C69C2E]/10 active:scale-95"
                >
                    + Apply Job
                </Button>
            </div>

            {/* Content */}
            {currentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentData.map((item) => (
                        <NegotiationCard
                            key={item.id}
                            id={item.id}
                            type={activeTab}
                            title={`Service Negotiation`}
                            description={item.message || "No message provided"}
                            price={`₦${(item.proposed_price_cents / 100).toLocaleString()}`}
                            status={item.status}
                            date={new Date(item.created_at).toLocaleDateString()}
                            initiator_id={item.initiator_id}
                            receiver_id={item.receiver_id}
                            onStatusChange={fetchNegotiations}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#141414] rounded-[2.5rem] border border-gray-100 dark:border-[#2A2A2A] shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(#C69C2E_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <Briefcase className="w-8 h-8 text-[#C69C2E]" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        No {activeTab === "outgoing" ? "Outgoing" : "Incoming"} Negotiations
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm px-4 text-sm">
                        You don't have any live {activeTab === "outgoing" ? "outgoing proposals" : "incoming contract offers"} right now.
                    </p>

                    <Button
                        className="bg-white dark:bg-transparent text-[#C69C2E] border border-[#C69C2E] hover:bg-[#C69C2E] hover:text-black font-extrabold transition-all px-8 py-3 rounded-xl h-auto active:scale-95"
                    >
                        + Apply Job
                    </Button>
                </div>
            )}
        </div>
    );
}
