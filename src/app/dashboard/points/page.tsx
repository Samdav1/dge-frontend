"use client";

import React, { useState, useEffect } from "react";
import { 
    Coins, 
    Wallet, 
    CreditCard, 
    ArrowUpRight, 
    CheckCircle, 
    AlertTriangle, 
    Loader2, 
    RefreshCw, 
    Gift, 
    Sparkles, 
    ExternalLink, 
    Copy, 
    Check,
    ChevronRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    getPointsData, 
    buyPointsWithWallet, 
    initiatePointsGatewayPurchase, 
    verifyPointsGatewayPurchase,
    PointsSummary,
    PointsTransactionItem
} from "@/features/points/actions";
import { toast } from "sonner";
import Link from "next/link";

export default function DGEPointsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PointsSummary | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Buy Points State
    const [pointsToBuy, setPointsToBuy] = useState<number>(10);
    const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("wallet");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Gateway Pending Modal / Verification
    const [gatewayPendingData, setGatewayPendingData] = useState<{
        reference: string;
        payment_link?: string;
        amount_naira: number;
        points: number;
    } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    const loadPoints = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        setError(null);

        const res = await getPointsData();
        if (res.success && res.data) {
            setData(res.data);
        } else {
            setError(res.error || "Failed to load points data");
        }
        setLoading(false);
        setIsRefreshing(false);
    };

    useEffect(() => {
        loadPoints();
    }, []);

    const rate = data?.rate_per_point || 100;
    const totalCost = pointsToBuy * rate;
    const walletBalance = data?.wallet_balance_naira || 0;
    const hasEnoughWalletBalance = walletBalance >= totalCost;

    const quickPacks = [10, 50, 100, 250, 500, 1000];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
        toast.success("Reference copied to clipboard");
    };

    const handleBuyWithWallet = async () => {
        if (pointsToBuy < 1) {
            toast.error("Please enter at least 1 point");
            return;
        }
        if (!hasEnoughWalletBalance) {
            toast.error(`Insufficient wallet balance. You need ₦${totalCost.toLocaleString()}`);
            return;
        }

        setIsProcessing(true);
        setError(null);
        try {
            const res = await buyPointsWithWallet(pointsToBuy);
            if (res.success) {
                toast.success(res.message || `Successfully purchased ${pointsToBuy} DGE Points!`);
                await loadPoints(true);
            } else {
                setError(res.error || "Failed to complete purchase");
                toast.error(res.error || "Failed to complete purchase");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBuyWithGateway = async () => {
        if (pointsToBuy < 1) {
            toast.error("Please enter at least 1 point");
            return;
        }

        setIsProcessing(true);
        setError(null);
        try {
            const res = await initiatePointsGatewayPurchase(pointsToBuy);
            if (res.success && res.data) {
                setGatewayPendingData({
                    reference: res.data.reference,
                    payment_link: res.data.payment_link,
                    amount_naira: res.data.amount_naira,
                    points: res.data.points,
                });
                if (res.data.payment_link) {
                    window.open(res.data.payment_link, "_blank");
                }
            } else {
                setError(res.error || "Failed to initiate payment gateway");
                toast.error(res.error || "Failed to initiate payment gateway");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!gatewayPendingData) return;
        setIsVerifying(true);
        try {
            const res = await verifyPointsGatewayPurchase(gatewayPendingData.reference);
            if (res.success) {
                toast.success(res.data?.message || "Payment verified! Points credited to your balance.");
                setGatewayPendingData(null);
                await loadPoints(true);
            } else {
                toast.info(res.data?.message || "Payment not yet confirmed. Please complete the checkout and try again.");
            }
        } catch (e: any) {
            toast.error("Failed to verify payment with gateway");
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#C69C2E] animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading DGE Points...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col relative text-gray-900 dark:text-white space-y-8">
            {/* Top Bar / Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1.5">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#C69C2E] font-medium">DGE Points</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C69C2E] to-[#99741b] flex items-center justify-center text-white shadow-md shadow-[#C69C2E]/20">
                            <Coins className="w-5 h-5" />
                        </div>
                        <span>DGE Points</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPoints(true)}
                        disabled={isRefreshing}
                        className="rounded-xl border-gray-200 dark:border-[#2A2A2A] text-xs font-semibold flex items-center gap-1.5 bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C69C2E]" : ""}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. DGE Points Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6 sm:p-7 rounded-3xl border border-gray-800 shadow-xl">
                    <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#C69C2E]/15 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total DGE Points</span>
                            <div className="w-8 h-8 rounded-lg bg-[#C69C2E]/20 border border-[#C69C2E]/40 flex items-center justify-center text-[#C69C2E]">
                                <Coins className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                                    {(data?.balance ?? 0).toLocaleString()}
                                </span>
                                <span className="text-sm font-bold text-[#C69C2E] uppercase">PTS</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                <span>Equivalent Value:</span>
                                <strong className="text-emerald-400 font-bold">₦{(data?.equivalent_naira ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Official Exchange Rate Card */}
                <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#2A2A2A] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Exchange Rate</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                                ₦{rate.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-gray-400">/ 1 Point</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Platform standard rate. Configurable in Admin Settings.
                        </p>
                    </div>
                </div>

                {/* 3. Available Wallet Balance Card */}
                <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-3xl border border-gray-100 dark:border-[#2A2A2A] shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Deposit Wallet</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#C69C2E] flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                                ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-[#202020]">
                            <span className="text-xs text-gray-400">Ready for instant purchase</span>
                            <Link href="/dashboard/wallet" className="text-xs font-bold text-[#C69C2E] hover:underline flex items-center gap-1">
                                Fund Wallet <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buy Points Section */}
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 dark:border-[#242424] gap-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#C69C2E]" />
                            <span>Buy DGE Points</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Purchase points directly using your wallet balance or the integrated payment gateway.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-[#C69C2E]/10 border border-amber-200/50 dark:border-[#C69C2E]/20 text-[#C69C2E] text-xs font-semibold self-start md:self-auto">
                        <Gift className="w-3.5 h-3.5" />
                        <span>Sign up bonus: 10 Points included</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Points selector */}
                    <div className="lg:col-span-7 space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 block">
                                Select or Enter Points
                            </label>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                                {quickPacks.map((pack) => (
                                    <button
                                        key={pack}
                                        type="button"
                                        onClick={() => setPointsToBuy(pack)}
                                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            pointsToBuy === pack
                                                ? "bg-[#C69C2E] text-white border-[#C69C2E] shadow-sm shadow-[#C69C2E]/30"
                                                : "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-gray-700 dark:text-gray-300 hover:border-[#C69C2E]/50"
                                        }`}
                                    >
                                        +{pack} pts
                                    </button>
                                ))}
                            </div>

                            {/* Custom Input */}
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={pointsToBuy || ""}
                                    onChange={(e) => setPointsToBuy(Math.max(1, parseInt(e.target.value) || 0))}
                                    placeholder="Enter points count"
                                    className="h-14 pl-4 pr-24 rounded-2xl text-lg font-bold bg-gray-50/50 dark:bg-[#181818] border-gray-200 dark:border-[#2E2E2E]"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase pointer-events-none">
                                    DGE Points
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
                                Choose Payment Method
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Wallet Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("wallet")}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                                        paymentMethod === "wallet"
                                            ? "border-[#C69C2E] bg-gradient-to-r from-amber-50/60 to-transparent dark:from-[#C69C2E]/10 dark:to-transparent ring-2 ring-[#C69C2E]/30"
                                            : "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-300 dark:hover:border-[#383838]"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        paymentMethod === "wallet"
                                            ? "bg-[#C69C2E] text-white"
                                            : "bg-gray-100 dark:bg-[#202020] text-gray-500"
                                    }`}>
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Pay from Wallet</h4>
                                            {paymentMethod === "wallet" && <CheckCircle className="w-4 h-4 text-[#C69C2E]" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Balance: ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </button>

                                {/* Direct Gateway Option */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("gateway")}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                                        paymentMethod === "gateway"
                                            ? "border-[#C69C2E] bg-gradient-to-r from-amber-50/60 to-transparent dark:from-[#C69C2E]/10 dark:to-transparent ring-2 ring-[#C69C2E]/30"
                                            : "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-300 dark:hover:border-[#383838]"
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        paymentMethod === "gateway"
                                            ? "bg-[#C69C2E] text-white"
                                            : "bg-gray-100 dark:bg-[#202020] text-gray-500"
                                    }`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Payment Gateway</h4>
                                            {paymentMethod === "gateway" && <CheckCircle className="w-4 h-4 text-[#C69C2E]" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Cards, Bank Transfer, USSD
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary & Checkout Action */}
                    <div className="lg:col-span-5 bg-gray-50 dark:bg-[#181818] p-6 rounded-3xl border border-gray-100 dark:border-[#262626] space-y-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Order Summary
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Points to Receive</span>
                                <strong className="font-bold text-gray-900 dark:text-white">+{pointsToBuy} DGE Points</strong>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Rate per Point</span>
                                <span>₦{rate.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span>Payment Method</span>
                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                    {paymentMethod === "wallet" ? "Deposit Wallet" : "Payment Gateway"}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 dark:border-[#2D2D2D] flex justify-between items-baseline">
                                <span className="font-bold text-base text-gray-900 dark:text-white">Total Amount</span>
                                <span className="text-2xl font-extrabold text-[#C69C2E]">
                                    ₦{totalCost.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {paymentMethod === "wallet" && !hasEnoughWalletBalance && (
                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                <p className="font-bold">Insufficient Wallet Balance</p>
                                <p>You need ₦{(totalCost - walletBalance).toLocaleString()} more in your wallet.</p>
                                <Link href="/dashboard/wallet" className="inline-block mt-1 font-bold text-[#C69C2E] hover:underline">
                                    Click here to fund your wallet &rarr;
                                </Link>
                            </div>
                        )}

                        <Button
                            onClick={paymentMethod === "wallet" ? handleBuyWithWallet : handleBuyWithGateway}
                            disabled={isProcessing || (paymentMethod === "wallet" && !hasEnoughWalletBalance)}
                            className="w-full h-13 rounded-2xl bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold text-base shadow-lg shadow-[#C69C2E]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>{paymentMethod === "wallet" ? "Confirm & Buy with Wallet" : "Proceed to Gateway Payment"}</span>
                                    <ArrowUpRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Gateway Verification Modal */}
            {gatewayPendingData && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 dark:border-[#2A2A2A] shadow-2xl space-y-6 text-center animate-in zoom-in-95">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-[#C69C2E] flex items-center justify-center mx-auto">
                            <CreditCard className="w-7 h-7" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Complete Gateway Payment</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Complete your payment of <strong className="text-gray-900 dark:text-white">₦{gatewayPendingData.amount_naira.toLocaleString()}</strong> to receive <strong className="text-[#C69C2E]">{gatewayPendingData.points} DGE Points</strong>.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#2D2D2D] text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment Reference</span>
                            <div className="flex items-center justify-between">
                                <code className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 truncate">
                                    {gatewayPendingData.reference}
                                </code>
                                <button
                                    onClick={() => handleCopy(gatewayPendingData.reference)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                                >
                                    {copiedRef ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {gatewayPendingData.payment_link && (
                                <a
                                    href={gatewayPendingData.payment_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 rounded-xl bg-gray-900 dark:bg-white dark:text-black text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <span>Open Checkout Page</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}

                            <Button
                                onClick={handleVerifyPayment}
                                disabled={isVerifying}
                                className="w-full h-12 rounded-xl bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Confirming Payment...</span>
                                    </>
                                ) : (
                                    <span>I Have Completed Payment</span>
                                )}
                            </Button>

                            <button
                                onClick={() => setGatewayPendingData(null)}
                                className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            >
                                Close / Pay Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Points History Table */}
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Points History</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Track all points earned, bonuses, and purchases.
                        </p>
                    </div>
                </div>

                {(!data?.transactions || data.transactions.length === 0) ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No points transactions recorded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6 sm:mx-0">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-[#202020] text-gray-400 uppercase text-[10px] tracking-wider">
                                    <th className="pb-3 px-4 font-semibold">Type</th>
                                    <th className="pb-3 px-4 font-semibold">Description</th>
                                    <th className="pb-3 px-4 font-semibold">Points</th>
                                    <th className="pb-3 px-4 font-semibold">Cost</th>
                                    <th className="pb-3 px-4 font-semibold">Status</th>
                                    <th className="pb-3 px-4 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-[#1C1C1C]">
                                {data.transactions.map((tx: PointsTransactionItem) => {
                                    const isPositive = tx.points > 0;
                                    const isBonus = tx.type === "signup_bonus";

                                    return (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-[#171717] transition-colors">
                                            <td className="py-3.5 px-4 font-bold capitalize text-gray-900 dark:text-white whitespace-nowrap">
                                                {isBonus ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-950/30 text-[#C69C2E]">
                                                        <Gift className="w-3 h-3" /> Signup Bonus
                                                    </span>
                                                ) : tx.type === "purchase_wallet" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                                        <Wallet className="w-3 h-3" /> Wallet Purchase
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                                                        <CreditCard className="w-3 h-3" /> Gateway Purchase
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-[240px] truncate">
                                                {tx.description}
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                +{tx.points} PTS
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {tx.naira_amount > 0 ? `₦${tx.naira_amount.toLocaleString()}` : "Free"}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                                                    tx.status === "successful"
                                                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                                                        : tx.status === "pending"
                                                        ? "bg-amber-50 dark:bg-amber-950/30 text-[#C69C2E]"
                                                        : "bg-red-50 dark:bg-red-950/30 text-red-500"
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
