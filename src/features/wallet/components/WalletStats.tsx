"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
    Plus, ArrowUpFromLine, ArrowDownToLine, Eye, EyeOff, 
    RefreshCw, Copy, CheckCircle2, TrendingUp, ShieldCheck 
} from "lucide-react";
import { WithdrawalModal } from "./WithdrawalModal";
import { WithdrawalAmountModal } from "./WithdrawalAmountModal";
import { DepositModal } from "./DepositModal";
import { getUserWallet, getUserTransactions } from "../actions";
import { useSession } from "next-auth/react";

interface WalletData {
    wallet_type: "earnings" | "deposit";
    balance_cents: number;
    currency: string;
    id: string;
}

interface BankAccount {
    id: string;
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
    is_default: boolean;
}

export function WalletStats() {
    const { data: session } = useSession();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [copied, setCopied] = useState(false);

    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [referralEarnings, setReferralEarnings] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [showBalance, setShowBalance] = useState<boolean>(true);

    const fetchWalletData = useCallback(async (isSilent = false) => {
        if (!isSilent) {
            setLoading(true);
        }
        try {
            const [walletResult, txnResult] = await Promise.all([
                getUserWallet(),
                getUserTransactions()
            ]);
            
            if (walletResult.success && Array.isArray(walletResult.data)) {
                setWallets(walletResult.data);
            }

            if (txnResult.success && Array.isArray(txnResult.data)) {
                const totalRefEarnings = txnResult.data
                    .filter((txn: any) => txn.reference && txn.reference.startsWith("REF-BONUS-") && txn.status === "completed")
                    .reduce((sum: number, txn: any) => sum + (txn.amount_cents / 100), 0);
                setReferralEarnings(totalRefEarnings);
            }

            const now = new Date();
            const formattedTime = now.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
            setLastUpdated(formattedTime);

        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            if (!isSilent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchWalletData(false);

        // Poll silently in the background every 8 seconds to update the user balance without page reload
        const interval = setInterval(() => {
            fetchWalletData(true);
        }, 8000);

        return () => clearInterval(interval);
    }, [fetchWalletData]);

    const getWalletBalance = (type: "earnings" | "deposit") => {
        const wallet = wallets.find(w => w.wallet_type === type);
        return wallet ? wallet.balance_cents / 100 : 0;
    };

    const earningsBalance = getWalletBalance("earnings");
    const depositBalance = getWalletBalance("deposit");
    const totalBalance = earningsBalance + depositBalance;

    const formatAmount = (amount: number) => {
        const currency = wallets[0]?.currency || "NGN";
        if (currency === "NGN") {
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2,
            }).format(amount);
        } else {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 2,
            }).format(amount);
        }
    };

    const handleAccountContinue = (account: BankAccount) => {
        setSelectedAccount(account);
        setIsWithdrawModalOpen(false);
        setIsAmountModalOpen(true);
    };

    const referralCode = (session?.user as any)?.referral_code || "DGE-MEMBER";
    const userName = session?.user?.name || "DGE Space Member";

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Desktop split layout vs Mobile stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* LEFT COLUMN: Main Card (with integrated bottom action bar) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Unified Premium Card Widget (Card body + bottom action bar in one border/outline) */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0C] border border-[#C69C2E]/25 shadow-2xl flex flex-col justify-between transition-all duration-500 hover:border-[#C69C2E]/40 group">
                        
                        {/* Premium Golden Glow Ring/Shine Effects */}
                        <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#C69C2E]/5 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />
                        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#C69C2E]/10 to-transparent rounded-full blur-[90px] pointer-events-none" />
                        
                        {/* TOP TIER: Balance & details */}
                        <div className="relative z-10 p-6 flex flex-col justify-between min-h-[170px] space-y-5 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[9px] font-extrabold tracking-widest uppercase text-[#C69C2E]/95">
                                        DGE SPACE DIGITAL WALLET
                                    </p>
                                    <h4 className="text-sm font-extrabold tracking-tight mt-0.5 text-white">
                                        {userName}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => fetchWalletData(false)}
                                    className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-200 cursor-pointer"
                                    title="Refresh Balance"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Total Balance
                                </span>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight truncate">
                                        {loading ? (
                                            <span className="inline-block w-44 h-9 bg-white/10 animate-pulse rounded-lg" />
                                        ) : !showBalance ? (
                                            "••••••••"
                                        ) : (
                                            formatAmount(totalBalance)
                                        )}
                                    </h1>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                                        title={showBalance ? "Hide Balance" : "Show Balance"}
                                    >
                                        {showBalance ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[9px] text-gray-400">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                                <span>
                                    {loading ? "Syncing..." : `Updated: ${lastUpdated}`}
                                </span>
                            </div>
                        </div>

                        {/* BOTTOM TIER: Connected Action Bar (Directly attached at bottom, rounded bottom corners) */}
                        <div className="relative z-10 bg-[#121215] border-t border-[#C69C2E]/15 px-6 py-5 flex justify-center gap-16 sm:gap-24 items-center rounded-b-[2rem]">
                            {/* Top Up Action */}
                            <div className="flex flex-col items-center gap-2 group">
                                <button
                                    onClick={() => setIsDepositModalOpen(true)}
                                    className="w-14 h-14 rounded-full bg-[#C69C2E] hover:bg-[#b08b29] text-black flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-lg shadow-[#C69C2E]/15 hover:shadow-[#C69C2E]/30"
                                    title="Top Up"
                                >
                                    <Plus className="w-6 h-6 stroke-[3]" />
                                </button>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors duration-200">
                                    Top Up
                                </span>
                            </div>

                            {/* Withdraw Action */}
                            <div className="flex flex-col items-center gap-2 group">
                                <button
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    className="w-14 h-14 rounded-full bg-[#1D1D22] hover:bg-[#25252b] border border-[#C69C2E]/40 text-[#C69C2E] flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer shadow-md shadow-black/40 hover:border-[#C69C2E] hover:text-[#e0b743]"
                                    title="Withdraw"
                                >
                                    <ArrowUpFromLine className="w-5 h-5 stroke-[2]" />
                                </button>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors duration-200">
                                    Withdraw
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Advanced Section & Sub-Wallets (7 cols on desktop) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Advanced Section Header */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#C69C2E] mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Advanced Wallet Partition
                        </h3>
                        
                        {/* Always 1 Row Layout (grid-cols-2 for both Mobile and Desktop) */}
                        <div className="grid grid-cols-2 gap-4">
                            
                            {/* Deposit Wallet Card */}
                            <div className="bg-gradient-to-br from-[#121215] to-[#0A0A0C] p-3.5 sm:p-5 rounded-[1.25rem] border border-[#C69C2E]/30 flex flex-col justify-between shadow-md shadow-black/40 relative overflow-hidden group hover:-translate-y-1 hover:border-[#C69C2E]/60 transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
                                {/* Tech Grid Background Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:10px_10px] opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#C69C2E]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#C69C2E]/8 transition-all" />
                                
                                <div className="space-y-2 sm:space-y-3 relative z-10 w-full flex flex-col justify-between h-full">
                                    <div className="flex items-start justify-between gap-1 w-full">
                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                            <div className="w-6 h-6 sm:w-8 h-8 rounded-lg bg-[#C69C2E]/10 flex items-center justify-center shrink-0 border border-[#C69C2E]/20">
                                                <ArrowDownToLine className="w-3 h-3 sm:w-4 sm:h-4 text-[#C69C2E]" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-[8px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-widest truncate">
                                                    Deposit
                                                </span>
                                                <p className="hidden sm:block text-[9px] text-gray-500 font-semibold mt-0.5">Escrow & Hiring</p>
                                            </div>
                                        </div>
                                        {/* Security Ledger Chip */}
                                        <div className="w-5 h-4 sm:w-6 h-5 rounded bg-gradient-to-br from-[#C69C2E]/20 to-[#C69C2E]/5 border border-[#C69C2E]/30 flex flex-col gap-0.5 p-0.5 justify-center items-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" title="Secure Ledger">
                                            <div className="w-full h-0.5 bg-[#C69C2E]/40 rounded-full" />
                                            <div className="w-3/4 h-0.5 bg-[#C69C2E]/40 rounded-full" />
                                            <div className="w-full h-0.5 bg-[#C69C2E]/40 rounded-full" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight truncate">
                                            {loading ? (
                                                <span className="inline-block w-16 sm:w-28 h-5 sm:h-7 bg-white/10 animate-pulse rounded-lg" />
                                            ) : !showBalance ? (
                                                "••••••••"
                                            ) : (
                                                formatAmount(depositBalance)
                                            )}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Earnings Wallet Card */}
                            <div className="bg-gradient-to-br from-[#121215] to-[#0A0A0C] p-3.5 sm:p-5 rounded-[1.25rem] border border-gray-800 dark:border-[#2A2A2A] flex flex-col justify-between shadow-md shadow-black/40 relative overflow-hidden group hover:-translate-y-1 hover:border-[#C69C2E]/40 transition-all duration-300 min-h-[100px] sm:min-h-[120px]">
                                {/* Tech Grid Background Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:10px_10px] opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#C69C2E]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#C69C2E]/8 transition-all" />
                                
                                <div className="space-y-2 sm:space-y-3 relative z-10 w-full flex flex-col justify-between h-full">
                                    <div className="flex items-start justify-between gap-1 w-full">
                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                            <div className="w-6 h-6 sm:w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-[#C69C2E]/20 transition-colors">
                                                <ArrowUpFromLine className="w-3  h-3 sm:w-4 sm:h-4 text-white group-hover:text-[#C69C2E] transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block text-[8px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-widest truncate">
                                                    Earnings
                                                </span>
                                                <p className="hidden sm:block text-[9px] text-gray-500 font-semibold mt-0.5">Gig Revenue</p>
                                            </div>
                                        </div>
                                        {/* Security Ledger Chip */}
                                        <div className="w-5 h-4 sm:w-6 h-5 rounded bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex flex-col gap-0.5 p-0.5 justify-center items-center shrink-0 opacity-70 group-hover:opacity-100 group-hover:border-[#C69C2E]/30 transition-all" title="Secure Ledger">
                                            <div className="w-full h-0.5 bg-white/30 group-hover:bg-[#C69C2E]/40 rounded-full" />
                                            <div className="w-3/4 h-0.5 bg-white/30 group-hover:bg-[#C69C2E]/40 rounded-full" />
                                            <div className="w-full h-0.5 bg-white/30 group-hover:bg-[#C69C2E]/40 rounded-full" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight truncate">
                                            {loading ? (
                                                <span className="inline-block w-16 sm:w-28 h-5 sm:h-7 bg-white/10 animate-pulse rounded-lg" />
                                            ) : !showBalance ? (
                                                "••••••••"
                                            ) : (
                                                formatAmount(earningsBalance)
                                            )}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Premium Referral Code Card */}
                    <div className="bg-[#0A0A0C] rounded-[2rem] border border-gray-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
                        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div className="flex items-center gap-1.5 text-[#C69C2E] font-bold text-xs uppercase tracking-widest mb-1">
                                <TrendingUp className="w-4 h-4" />
                                Refer & Earn program
                            </div>
                            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                                Invite friends and earn 5% of their first funding deposit directly into your earnings wallet.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            {/* Total Referral Earnings */}
                            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Earnings</span>
                                <div className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 w-full sm:w-28 text-center truncate">
                                    {formatAmount(referralEarnings)}
                                </div>
                            </div>

                            {/* Referral Code */}
                            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Your Code</span>
                                <div className="flex items-center w-full sm:w-auto border border-gray-800 rounded-xl overflow-hidden bg-[#121212]">
                                    <div className="px-3 py-2 font-mono text-xs font-bold text-white w-full sm:w-24 text-center tracking-wider truncate">
                                        {referralCode}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`flex items-center justify-center shrink-0 h-full p-2 transition-colors cursor-pointer ${
                                            copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                                        }`}
                                    >
                                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <DepositModal
                open={isDepositModalOpen}
                onOpenChange={setIsDepositModalOpen}
                onSuccess={fetchWalletData}
            />

            <WithdrawalModal
                open={isWithdrawModalOpen}
                onOpenChange={setIsWithdrawModalOpen}
                onContinue={handleAccountContinue}
            />

            <WithdrawalAmountModal
                open={isAmountModalOpen}
                onOpenChange={setIsAmountModalOpen}
                selectedAccount={selectedAccount}
                earningsBalance={earningsBalance}
                onSuccess={fetchWalletData}
            />
        </div>
    );
}
