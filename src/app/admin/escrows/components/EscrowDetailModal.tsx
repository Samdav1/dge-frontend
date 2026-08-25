"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, User, Tag, ShieldCheck, Wallet, ArrowRight, Info, AlertCircle, Unlock, XCircle } from "lucide-react";
import { useStatusModal } from "../../components/StatusModalProvider";

interface EscrowDetail {
    id: string;
    amount: string;
    status: string;
    created_at: string;
    updated_at: string;
    service: {
        name: string;
        category: string;
        description: string;
        price: string;
    };
    negotiation: {
        proposed_price: string;
        original_price: string;
        status: string;
    };
    payer: {
        username: string;
        email: string;
        full_name: string | null;
    };
    payee: {
        username: string;
        email: string;
        full_name: string | null;
    };
}

interface Props {
    escrowId: string;
    onClose: () => void;
}

export default function EscrowDetailModal({ escrowId, onClose }: Props) {
    const [data, setData] = useState<EscrowDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const { showModal, hideModal } = useStatusModal();

    const fetchDetail = async () => {
        if (!escrowId || escrowId === "undefined" || escrowId === "null") {
            console.warn("[EscrowDetailModal] Invalid escrowId:", escrowId);
            setError("Invalid Escrow ID. Please refresh and try again.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/escrows/${escrowId}`);
            if (!res.ok) throw new Error("Failed to load escrow details");
            const d = await res.json();
            setData(d);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [escrowId]);

    const handleRelease = () => {
        showModal({
            type: "confirm",
            title: "Release Escrow Funds",
            message: `Are you sure you want to release ${data?.amount} to ${data?.payee?.username}? This will immediately credit their wallet balance.`,
            onConfirm: async () => {
                hideModal();
                setActionLoading(true);
                try {
                    const res = await fetch(`/api/admin/escrows/${escrowId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "released" }),
                    });
                    if (res.ok) {
                        showModal({
                            type: "success",
                            title: "Funds Released",
                            message: "Escrow funds have been successfully released."
                        });
                        fetchDetail();
                    } else {
                        const err = await res.json();
                        showModal({
                            type: "error",
                            title: "Release Failed",
                            message: err.detail || "Failed to update escrow status"
                        });
                    }
                } catch (err: any) {
                    console.error(err);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleRefund = () => {
        showModal({
            type: "confirm",
            title: "Refund Escrow Funds",
            message: `Are you sure you want to refund ${data?.amount} back to ${data?.payer?.username}? This will restore their wallet balance.`,
            onConfirm: async () => {
                hideModal();
                setActionLoading(true);
                try {
                    const res = await fetch(`/api/admin/escrows/${escrowId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "refunded" }),
                    });
                    if (res.ok) {
                        showModal({
                            type: "success",
                            title: "Funds Refunded",
                            message: "Escrow funds have been successfully refunded to the payer."
                        });
                        fetchDetail();
                    } else {
                        const err = await res.json();
                        showModal({
                            type: "error",
                            title: "Refund Failed",
                            message: err.detail || "Failed to update escrow status"
                        });
                    }
                } catch (err: any) {
                    console.error(err);
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    if (!escrowId) return null;

    const isHeldOrDisputed = data?.status === "HELD" || data?.status === "DISPUTED";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 select-none">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512]">
                            <Wallet size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-base font-bold text-slate-800 leading-tight">Escrow Information</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {escrowId.slice(0, 12)}...</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                            <Loader2 size={32} className="animate-spin" />
                            <span className="text-xs font-bold text-slate-400">Fetching escrow records...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
                            <AlertCircle size={32} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    ) : data && (
                        <>
                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escrow Balance</span>
                                    <span className="text-2xl font-black text-white">{data.amount}</span>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                                            data.status === "HELD" ? "bg-amber-500/20 text-amber-400" :
                                            data.status === "RELEASED" ? "bg-emerald-500/20 text-emerald-400" :
                                            data.status === "DISPUTED" ? "bg-red-500/20 text-red-400" :
                                            "bg-blue-500/20 text-blue-400"
                                        }`}>
                                            {data.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created Date</span>
                                        <span className="text-xs font-bold text-slate-700">{data.created_at}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 pt-3 border-t border-slate-200/50 mt-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Activity</span>
                                        <span className="text-xs font-bold text-slate-500">{data.updated_at || "—"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Tag size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Service & Pricing</span>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-100 bg-white space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{data.service.name}</span>
                                            <span className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{data.service.category}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Original Price</span>
                                            <span className="text-sm font-bold text-slate-500 line-through decoration-slate-300">{data.service.price}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                            {data.service.description || "No description provided for this service."}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Participants */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <User size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Transaction Participants</span>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                    {/* Payer */}
                                    <div className="flex-1 flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100 shrink-0">
                                                PY
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] font-bold text-blue-500 uppercase">Payer (Client)</span>
                                                <span className="text-[11px] font-bold text-slate-800 truncate">{data.payer.username}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium truncate pl-10">{data.payer.email}</span>
                                    </div>

                                    <div className="text-slate-300">
                                        <ArrowRight size={16} />
                                    </div>

                                    {/* Payee */}
                                    <div className="flex-1 flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-100 shrink-0">
                                                PE
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase">Payee (Freelancer)</span>
                                                <span className="text-[11px] font-bold text-slate-800 truncate">{data.payee.username}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium truncate pl-10">{data.payee.email}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Additional Info */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Info size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Internal Audit Details</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Negotiation Status</span>
                                        <span className="text-xs font-bold text-slate-700 mt-1 uppercase">{data.negotiation.status}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Final Agreed Price</span>
                                        <span className="text-xs font-black text-[#b68512] mt-1">{data.negotiation.proposed_price}</span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {isHeldOrDisputed && (
                            <button
                                onClick={handleRelease}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                                <Unlock size={14} /> Release Funds
                            </button>
                        )}
                        {isHeldOrDisputed && (
                            <button
                                onClick={handleRefund}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                                <XCircle size={14} /> Refund Payer
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200 cursor-pointer"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );
}
