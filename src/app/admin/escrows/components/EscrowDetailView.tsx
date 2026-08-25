"use client";

import { useState, useEffect } from "react";
import { 
    User, 
    ShieldCheck, 
    DollarSign, 
    XCircle, 
    CheckCircle, 
    Unlock, 
    ArrowRight, 
    Loader2, 
    AlertTriangle,
    FileText,
    Receipt,
    RefreshCw,
    X,
    Clock,
    Tag
} from "lucide-react";
import { useStatusModal } from "../../components/StatusModalProvider";

interface EscrowDetailViewProps {
    item: any;
    onBack: () => void;
}

interface EscrowDetailData {
    id: string;
    amount: string;
    fee_amount?: string;
    released_amount?: string;
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

export default function EscrowDetailView({ item, onBack }: EscrowDetailViewProps) {
    const [selectedTab, setSelectedTab] = useState<"Overview" | "Timeline">("Overview");
    const [detail, setDetail] = useState<EscrowDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);

    const { showModal, hideModal } = useStatusModal();

    const escrowId = item?.id;

    const fetchDetail = async () => {
        if (!escrowId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/escrows/${escrowId}`);
            if (res.ok) {
                const d = await res.json();
                setDetail(d);
            } else {
                console.error("Failed to load escrow details");
            }
        } catch (err) {
            console.error("Error loading escrow details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [escrowId]);

    const handleReleaseFunds = () => {
        showModal({
            type: "confirm",
            title: "Authorize Release of Funds",
            message: `Are you sure you want to release ${detail?.released_amount || detail?.amount || item?.amount} (after deducting ${detail?.fee_amount || item?.fee_amount || 'platform fee'}) to ${detail?.payee?.username || item?.payee_name}? This action will credit the payee's wallet immediately.`,
            confirmText: "Release Funds",
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
                            message: "Escrow funds have been successfully released to the payee."
                        });
                        fetchDetail();
                    } else {
                        const err = await res.json();
                        showModal({
                            type: "error",
                            title: "Release Failed",
                            message: err.detail || err.error || "Failed to release escrow funds"
                        });
                    }
                } catch (err: any) {
                    showModal({
                        type: "error",
                        title: "Error",
                        message: err.message || "An unexpected error occurred"
                    });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleRefundPayer = () => {
        showModal({
            type: "confirm",
            title: "Refund Payer",
            message: `Are you sure you want to refund ${detail?.amount || item?.amount} to ${detail?.payer?.username || item?.payer_name}? This action will return the held funds to the payer's wallet balance.`,
            confirmText: "Refund Payer",
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
                            message: err.detail || err.error || "Failed to refund escrow funds"
                        });
                    }
                } catch (err: any) {
                    showModal({
                        type: "error",
                        title: "Error",
                        message: err.message || "An unexpected error occurred"
                    });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    if (!item) return null;

    const currentStatus = (detail?.status || item?.status || "HELD").toUpperCase();
    const isHeld = currentStatus === "HELD";
    const isDisputed = currentStatus === "DISPUTED";
    const isReleased = currentStatus === "RELEASED";
    const isRefunded = currentStatus === "REFUNDED";

    const statusBadgeClass = 
        isReleased ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
        isRefunded ? "bg-blue-50 text-blue-600 border-blue-100" :
        isDisputed ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
        "bg-amber-50 text-amber-600 border-amber-100";

    return (
        <div className="space-y-6 flex-1 flex flex-col select-none animate-fade-in pt-2 relative">
            {/* Back button */}
            <button
                onClick={onBack}
                className="px-3 py-1 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 select-none shadow-sm transition-all flex items-center gap-1 leading-none mb-2 w-fit cursor-pointer"
            >
                ← Back to Escrow List
            </button>

            {/* Top header strip */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-6 select-none relative overflow-hidden">
                <div className="flex flex-col select-none">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                            {detail?.service?.name || item?.service_name || "Service Details"}
                        </h2>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-[9px] border uppercase ${statusBadgeClass}`}>
                            {currentStatus}
                        </span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold select-none leading-none">
                        Escrow ID: {escrowId} • Created on {detail?.created_at || item?.created_at || "—"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {(isHeld || isDisputed) && (
                        <button 
                            onClick={handleRefundPayer}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl font-bold text-[11px] text-white flex items-center gap-1.5 select-none hover:scale-[1.01] shadow-sm transition-all cursor-pointer h-10"
                        >
                            <XCircle size={15} /> <span>Refund Payer</span>
                        </button>
                    )}
                    {(isHeld || isDisputed) && (
                        <button 
                            onClick={handleReleaseFunds}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl font-bold text-[11px] text-white flex items-center gap-1.5 select-none hover:scale-[1.01] shadow-sm transition-all cursor-pointer h-10"
                        >
                            <Unlock size={15} /> <span>Release Funds</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Dispute Warning Banner if DISPUTED */}
            {isDisputed && (
                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <h4 className="text-sm font-bold text-red-800">Escrow in Dispute</h4>
                            <p className="text-xs text-red-600 font-medium mt-1">
                                This escrow is locked due to an active dispute between the client ({detail?.payer?.username || item?.payer_name}) and provider ({detail?.payee?.username || item?.payee_name}). As Administrator, you can resolve this dispute by releasing funds or issuing a refund.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={handleReleaseFunds}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Unlock size={14} /> Release to Payee
                        </button>
                        <button 
                            onClick={handleRefundPayer}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <XCircle size={14} /> Refund Payer
                        </button>
                    </div>
                </div>
            )}

            {/* Financial Stats Grid - 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 select-none">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between h-[115px] select-none hover:scale-[1.01] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative">
                    <div className="flex flex-col select-none leading-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none leading-tight mb-2">
                            Total Escrow Amount
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-slate-800 select-none">
                            {detail?.amount || item?.amount || "₦0.00"}
                        </span>
                    </div>
                    <div className="text-slate-100 font-extrabold text-4xl select-none absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        ₦
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between h-[115px] select-none hover:scale-[1.01] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative">
                    <div className="flex flex-col select-none leading-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none leading-tight mb-2">
                            Platform Fee Deducted
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-amber-600 select-none">
                            {detail?.fee_amount || item?.fee_amount || "₦0.00"}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm select-none absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        %
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between h-[115px] select-none hover:scale-[1.01] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative">
                    <div className="flex flex-col select-none leading-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none leading-tight mb-2">
                            Net Released Payout
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-emerald-500 select-none">
                            {isReleased ? (detail?.released_amount || item?.released_amount || detail?.amount || item?.amount) : "₦0.00"}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 font-extrabold text-xl select-none absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        ✓
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between h-[115px] select-none hover:scale-[1.01] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative">
                    <div className="flex flex-col select-none leading-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none leading-tight mb-2">
                            Funds Held / Pending
                        </span>
                        <span className={`text-2xl font-bold tracking-tight select-none ${isDisputed ? "text-red-500" : isHeld ? "text-amber-500" : "text-slate-400"}`}>
                            {(isHeld || isDisputed) ? (detail?.amount || item?.amount) : "₦0.00"}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 font-extrabold text-xl select-none absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        !
                    </div>
                </div>
            </div>

            {/* Inner sub tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 select-none w-full bg-white px-4 pt-1 rounded-t-xl border-t border-x border-slate-100">
                {(["Overview", "Timeline"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-2.5 text-xs font-bold transition-all relative select-none leading-none border-b-2 w-1/2 md:w-fit text-center cursor-pointer ${
                            selectedTab === tab
                                ? "border-[#b68512] text-slate-800"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content per Tab */}
            {selectedTab === "Overview" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 select-none animate-fade-in">
                    {/* Left Column: Service Details & Category */}
                    <div className="space-y-6 select-none">
                        {/* Service & Job Description card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-3 select-none min-h-[225px]">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                                <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                                    Service & Description
                                </h4>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase border border-amber-100">
                                    {detail?.service?.category || "General Service"}
                                </span>
                            </div>
                            {loading ? (
                                <div className="flex items-center justify-center py-8 text-slate-400">
                                    <Loader2 size={24} className="animate-spin mr-2" /> Loading service info...
                                </div>
                            ) : (
                                <p className="text-xs text-slate-600 font-medium leading-relaxed leading-6 flex-1 pt-1">
                                    {detail?.service?.description || "No description specified."}
                                </p>
                            )}
                        </div>

                        {/* Pricing Breakdown Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-3 select-none">
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5">
                                Agreed Negotiation & Pricing
                            </h4>
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Original Price</span>
                                    <span className="text-sm font-bold text-slate-700 mt-1">{detail?.negotiation?.original_price || detail?.service?.price || item?.amount}</span>
                                </div>
                                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col">
                                    <span className="text-[10px] text-amber-600 font-bold uppercase">Agreed Escrow Price</span>
                                    <span className="text-sm font-bold text-[#b68512] mt-1">{detail?.negotiation?.proposed_price || detail?.amount || item?.amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Seller & Buyer Participants */}
                    <div className="space-y-6 select-none">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between select-none min-h-[350px]">
                            <div className="space-y-6">
                                {/* Payer block */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5 leading-none">
                                        Payer (Client)
                                    </h4>
                                    <div className="flex items-center gap-3 pt-1 select-none">
                                        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {(detail?.payer?.username || item?.payer_name || "PY").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col select-none leading-tight">
                                            <span className="font-bold text-xs text-slate-800">
                                                {detail?.payer?.username || item?.payer_name || "Payer"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold select-none mt-0.5">
                                                {detail?.payer?.email || "Payer Account"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Payee block */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5 leading-none">
                                        Payee (Provider)
                                    </h4>
                                    <div className="flex items-center gap-3 pt-1 select-none">
                                        <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm">
                                            {(detail?.payee?.username || item?.payee_name || "PE").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col select-none leading-tight">
                                            <span className="font-bold text-xs text-slate-800">
                                                {detail?.payee?.username || item?.payee_name || "Payee"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold select-none mt-0.5">
                                                {detail?.payee?.email || "Payee Account"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Payment & Escrow details bar */}
                    <div className="col-span-1 xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6 select-none animate-fade-in relative mt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none border-b border-slate-50 pb-4">
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-none">
                                Payment Audit & Management
                            </h4>

                            <div className="flex items-center gap-3 select-none">
                                {(isHeld || isDisputed) && (
                                    <button 
                                        onClick={handleReleaseFunds}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 select-none hover:scale-[1.01] shadow-sm transition-all cursor-pointer h-9"
                                    >
                                        <Unlock size={14} /> <span>Authorize Release</span>
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowTransactionsModal(true)}
                                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-[10px] text-slate-600 flex items-center gap-1.5 select-none hover:text-slate-800 transition-all shadow-sm cursor-pointer h-9"
                                >
                                    <Receipt size={14} className="text-blue-500" /> <span>Audit Transactions</span>
                                </button>
                            </div>
                        </div>

                        {/* Balance Breakdown card boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 select-none pt-1">
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 select-none flex flex-col justify-between h-[90px]">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none leading-none">
                                    Total Escrow Budget
                                </span>
                                <span className="font-bold text-base text-slate-800 select-none leading-none">
                                    {detail?.amount || item?.amount}
                                </span>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 select-none flex flex-col justify-between h-[90px]">
                                <span className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider select-none leading-none">
                                    Platform Commission Fee
                                </span>
                                <span className="font-bold text-base text-amber-600 select-none leading-none">
                                    {detail?.fee_amount || item?.fee_amount || "₦0.00"}
                                </span>
                            </div>
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 select-none flex flex-col justify-between h-[90px]">
                                <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider select-none leading-none">
                                    Released to Payee (Net)
                                </span>
                                <span className="font-bold text-base text-emerald-600 select-none leading-none">
                                    {isReleased ? (detail?.released_amount || item?.released_amount || detail?.amount || item?.amount) : "₦0.00"}
                                </span>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 select-none flex flex-col justify-between h-[90px]">
                                <span className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider select-none leading-none">
                                    Pending / Locked
                                </span>
                                <span className="font-bold text-base text-amber-600 select-none leading-none">
                                    {(isHeld || isDisputed) ? (detail?.amount || item?.amount) : "₦0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Timeline view */
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-6 select-none animate-fade-in">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5">
                        Escrow Activity Timeline
                    </h4>
                    <div className="space-y-6 relative pl-6 border-l-2 border-slate-100 ml-2">
                        {/* Event 1 */}
                        <div className="relative">
                            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full absolute -left-[31px] top-0.5 border-2 border-white ring-4 ring-blue-50"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">Escrow Created & Funds Locked</span>
                                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{detail?.created_at || item?.created_at || "—"}</span>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    Amount {detail?.amount || item?.amount} locked from payer ({detail?.payer?.username || item?.payer_name}) into escrow wallet.
                                </p>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="relative">
                            <div className={`w-3.5 h-3.5 rounded-full absolute -left-[31px] top-0.5 border-2 border-white ring-4 ${isDisputed ? "bg-red-500 ring-red-50" : isReleased ? "bg-emerald-500 ring-emerald-50" : isRefunded ? "bg-blue-500 ring-blue-50" : "bg-amber-500 ring-amber-50"}`}></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">Current Status: {currentStatus}</span>
                                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{detail?.updated_at || "—"}</span>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    {isDisputed ? "Dispute flagged. Waiting for admin decision to release or refund." :
                                     isReleased ? "Funds successfully released to payee." :
                                     isRefunded ? "Funds successfully refunded to payer." :
                                     "Escrow active and funds safely held."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Transactions Modal */}
            {showTransactionsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 select-none">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <Receipt size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-800 leading-tight">Transactions Audit Log</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Escrow ID: {escrowId?.slice(0, 12)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowTransactionsModal(false)}
                                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800">Initial Escrow Deposit</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Payer: {detail?.payer?.username || item?.payer_name}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{detail?.created_at || item?.created_at}</span>
                                </div>
                                <span className="font-bold text-xs text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                                    {detail?.amount || item?.amount}
                                </span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800">State Transition</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Status: {currentStatus}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{detail?.updated_at || "—"}</span>
                                </div>
                                <span className={`font-bold text-[10px] px-2.5 py-1 rounded-lg border uppercase ${statusBadgeClass}`}>
                                    {currentStatus}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Ledger Record</span>
                            <button
                                onClick={() => setShowTransactionsModal(false)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
