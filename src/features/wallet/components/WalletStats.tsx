"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Copy, CheckCircle2, Coins, TrendingUp, ShieldCheck } from "lucide-react";
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

    const fetchWalletData = useCallback(async () => {
        setLoading(true);
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

        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const getWalletBalance = (type: "earnings" | "deposit") => {
        const wallet = wallets.find(w => w.wallet_type === type);
        return wallet ? wallet.balance_cents / 100 : 0;
    };

    const earningsBalance = getWalletBalance("earnings");
    const depositBalance = getWalletBalance("deposit");
    const totalBalance = earningsBalance + depositBalance;

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: wallets[0]?.currency || "NGN",
            minimumFractionDigits: 2,
        }).format(amount);

    const handleAccountContinue = (account: BankAccount) => {
        setSelectedAccount(account);
        setIsWithdrawModalOpen(false);
        setIsAmountModalOpen(true);
    };

    const referralCode = (session?.user as any)?.referral_code || "N/A";
    const userName = session?.user?.name || "DGE Space Member";

    const copyToClipboard = () => {
        if (referralCode !== "N/A") {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Premium Wallet Panel (No credit card metaphor) */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0d0c0b] border border-[#C69C2E]/20 shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[220px] group transition-all duration-500 hover:border-[#C69C2E]/40">
                {/* Premium Hover Shine Effect */}
                <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />
                
                {/* Glowing Effects */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#C69C2E]/10 to-transparent rounded-full blur-[100px] pointer-events-none group-hover:from-[#C69C2E]/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col gap-6 w-full">
                    {/* Top part: Label & Refresh */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C69C2E]/20 to-[#8d6d1d]/20 border border-[#C69C2E]/30 flex items-center justify-center">
                                <Coins className="w-4 h-4 text-[#C69C2E]" />
                            </div>
                            <span className="text-gray-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">
                                Available Balance
                            </span>
                        </div>
                        <button
                            onClick={fetchWalletData}
                            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all duration-200"
                            title="Refresh Balance"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Middle part: Balance Display */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight truncate">
                            {loading ? (
                                <span className="inline-block w-48 h-12 bg-white/10 animate-pulse rounded-lg" />
                            ) : formatAmount(totalBalance)}
                        </h1>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#C69C2E]/80 mt-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Secured Wallet Account</span>
                        </div>
                    </div>

                    {/* Bottom part: Action Buttons - side-by-side */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full pt-2">
                        <button
                            onClick={() => setIsDepositModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#C69C2E] to-[#a37e20] text-black hover:brightness-110 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-xl font-extrabold text-[11px] sm:text-sm transition-all duration-300 shadow-lg shadow-[#C69C2E]/10 active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                            <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            Fund<span className="hidden sm:inline"> Wallet</span>
                        </button>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/15 text-white border border-white/10 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-xl font-extrabold text-[11px] sm:text-sm transition-all duration-300 backdrop-blur-md active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                            <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            Withdraw<span className="hidden sm:inline"> Funds</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Balances Grid with Elevated Aesthetics */}
            <div className="grid grid-cols-2 gap-4">
                {/* Funding Wallet Card */}
                <div className="bg-white dark:bg-[#141414] p-3.5 sm:p-5 rounded-[1.5rem] border border-gray-100 dark:border-[#2A2A2A] flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center shrink-0">
                                <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C69C2E]" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:tracking-widest">Funding</span>
                        </div>
                        <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                            {loading ? (
                                <span className="inline-block w-20 sm:w-28 h-6 sm:h-8 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
                            ) : formatAmount(depositBalance)}
                        </h3>
                    </div>
                </div>

                {/* Earnings Wallet Card */}
                <div className="bg-white dark:bg-[#141414] p-3.5 sm:p-5 rounded-[1.5rem] border border-gray-100 dark:border-[#2A2A2A] flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-[9px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:tracking-widest">Earnings</span>
                        </div>
                        <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                            {loading ? (
                                <span className="inline-block w-20 sm:w-28 h-6 sm:h-8 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
                            ) : formatAmount(earningsBalance)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Compact Referral Banner */}
            <div className="bg-gray-50 dark:bg-[#141414] rounded-[2rem] border border-gray-100 dark:border-[#2A2A2A] p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm mt-2 transition-all hover:shadow-md">
                
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="flex items-center gap-1.5 text-[#C69C2E] font-bold text-xs uppercase tracking-widest mb-1.5">
                        <TrendingUp className="w-4 h-4" />
                        Refer & Earn
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                        Earn 5% of your friend's first deposit. Double your savings!
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Total Referral Earnings */}
                    <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5">Total Earnings</span>
                        <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 sm:py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 w-full text-center truncate">
                            {formatAmount(referralEarnings)}
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5">Your Referral Code</span>
                        <div className="flex items-center w-full sm:w-auto border border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A]">
                            <div className="px-3 sm:px-4 py-2 sm:py-2.5 font-mono text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white w-full text-center tracking-wider truncate">
                                {referralCode}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center justify-center shrink-0 h-full px-3 sm:px-4 py-3 sm:py-3.5 transition-colors cursor-pointer ${
                                    copied ? 'bg-emerald-50 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
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
