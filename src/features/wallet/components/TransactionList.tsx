"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Eye, Search, Copy, CheckCircle2, Loader2, ArrowLeftRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserTransactions } from "../actions";
import Link from "next/link";

interface TransactionListProps {
    limit?: number;
    showFilters?: boolean;
    showSeeAll?: boolean;
}

export function TransactionList({ limit, showFilters = false, showSeeAll = false }: TransactionListProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<any | null>(null);
    const [copied, setCopied] = useState(false);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        async function fetchTransactions() {
            setLoading(true);
            try {
                const res = await getUserTransactions();
                if (res.success && res.data) {
                    setTransactions(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTransactions();
    }, []);

    const formatDate = (isoStr: string | null | undefined) => {
        if (!isoStr) return "—";
        return new Date(isoStr).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    const formatCurrency = (cents: number | null | undefined) => {
        if (cents == null) return "—";
        return `₦${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            const matchesSearch = 
                tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (tx.reference && tx.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
                tx.type.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesType = selectedType === "all" || tx.type === selectedType;
            const matchesStatus = selectedStatus === "all" || tx.status === selectedStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [transactions, searchQuery, selectedType, selectedStatus]);

    // Calculate Inflow & Outflow totals for completed transactions
    const { totalInflow, totalOutflow } = useMemo(() => {
        let inflow = 0;
        let outflow = 0;
        transactions.forEach((tx) => {
            if (tx.status === "completed") {
                const t = tx.type.toLowerCase();
                if (t === "deposit" || t === "refund" || t === "escrow_release") {
                    inflow += tx.amount_cents || 0;
                } else if (t === "withdrawal" || t === "payment") {
                    outflow += tx.amount_cents || 0;
                }
            }
        });
        return { totalInflow: inflow, totalOutflow: outflow };
    }, [transactions]);

    // Apply limit if specified
    const displayedTransactions = useMemo(() => {
        if (limit) {
            return filteredTransactions.slice(0, limit);
        }
        return filteredTransactions;
    }, [filteredTransactions, limit]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-8 flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C2E]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Ledger Summary Cards (Inflow/Outflow Overview) - Full page only */}
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Inflow Ledger Card */}
                    <div className="bg-gradient-to-br from-[#121215] to-[#0A0A0C] border border-[#C69C2E]/20 p-5 rounded-[1.5rem] relative overflow-hidden group hover:border-[#C69C2E]/40 transition-all duration-300">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:10px_10px] opacity-40 pointer-events-none" />
                        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Inflow Volume</p>
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {formatCurrency(totalInflow)}
                                </h3>
                                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                    <span>Received & Refunded</span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <ArrowDownLeft className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Outflow Ledger Card */}
                    <div className="bg-gradient-to-br from-[#121215] to-[#0A0A0C] border border-[#C69C2E]/20 p-5 rounded-[1.5rem] relative overflow-hidden group hover:border-[#C69C2E]/40 transition-all duration-300">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:10px_10px] opacity-40 pointer-events-none" />
                        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Outflow Volume</p>
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {formatCurrency(totalOutflow)}
                                </h3>
                                <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>Withdrawn & Paid</span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters Bar (Only on advanced full page) */}
            {showFilters && (
                <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                        <Input
                            placeholder="Search by ID, reference, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-gray-50/50 dark:bg-[#1C1C1C] border-gray-100 dark:border-[#2A2A2A] rounded-xl focus:border-[#C69C2E]/50 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all text-xs"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="h-12 px-4 bg-gray-50/50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-[#2A2A2A] rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#C69C2E]/50 cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer">Transfer</option>
                            <option value="payment">Payment</option>
                            <option value="refund">Refund</option>
                            <option value="escrow_release">Escrow Release</option>
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-12 px-4 bg-gray-50/50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-[#2A2A2A] rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#C69C2E]/50 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="reversed">Reversed</option>
                        </select>
                    </div>
                </div>
            )}

            {/* List Container */}
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {limit ? "Recent Transactions" : "Transaction History"}
                    </h3>
                    {showSeeAll && (
                        <Link
                            href="/dashboard/wallet/transactions"
                            className="text-xs font-black text-[#C69C2E] hover:underline"
                        >
                            See All Transactions
                        </Link>
                    )}
                </div>

                {/* Table View - Hidden on Mobile */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0F0F12] border-b border-[#2A2A2A]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-[#2A2A2A]">
                            {displayedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                displayedTransactions.map((tx) => {
                                    const isInflow = tx.type === "deposit" || tx.type === "refund" || tx.type === "escrow_release";
                                    return (
                                        <tr key={tx.id} className="hover:bg-gradient-to-r hover:from-[#C69C2E]/5 hover:to-transparent transition-all duration-200">
                                            {/* Colored indicator bar inside the first cell */}
                                            <td className={`px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 border-l-4 ${
                                                isInflow ? "border-l-emerald-500/70" : "border-l-red-500/70"
                                            }`}>
                                                {tx.id.substring(0, 8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white">
                                                {formatCurrency(tx.amount_cents)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {tx.type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${tx.status === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                                                            : tx.status === "failed" || tx.status === "reversed"
                                                                ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                                                                : "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400"
                                                        }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="h-8 w-8 text-gray-400 hover:text-[#C69C2E] dark:hover:text-[#C69C2E] cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile list view */}
                <div className="block sm:hidden divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                    {displayedTransactions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            No transactions found.
                        </div>
                    ) : (
                        displayedTransactions.map((tx) => {
                            const isInflow = tx.type === "deposit" || tx.type === "refund" || tx.type === "escrow_release";
                            return (
                                <div 
                                    key={tx.id} 
                                    onClick={() => setSelectedTx(tx)}
                                    className={`p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A]/30 cursor-pointer active:bg-gray-100 transition-all border-l-4 ${
                                        isInflow ? "border-l-emerald-500/70" : "border-l-red-500/70"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                            isInflow
                                                ? "bg-green-50 dark:bg-green-500/10 text-green-600"
                                                : "bg-red-50 dark:bg-red-500/10 text-red-600"
                                        }`}>
                                            <ArrowLeftRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{tx.type.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(tx.amount_cents)}</p>
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize mt-1 ${
                                            tx.status === "completed"
                                                ? "bg-green-50 text-green-700 dark:bg-green-500/10"
                                                : tx.status === "failed" || tx.status === "reversed"
                                                    ? "bg-red-50 text-red-700 dark:bg-red-500/10"
                                                    : "bg-orange-50 text-orange-700 dark:bg-orange-500/10"
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Transaction Detail Dialog */}
            <Dialog open={selectedTx !== null} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-3xl border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
                    {selectedTx && (
                        <div className="p-6">
                            <DialogHeader className="mb-6 flex flex-col items-center text-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                                    selectedTx.type === "deposit" || selectedTx.type === "refund"
                                        ? "bg-green-50 dark:bg-green-500/10 text-green-600"
                                        : "bg-red-50 dark:bg-red-500/10 text-red-600"
                                }`}>
                                    <ArrowLeftRight className="w-6 h-6" />
                                </div>
                                <DialogTitle className="text-lg font-black capitalize">{selectedTx.type.replace('_', ' ')}</DialogTitle>
                                <p className="text-2xl font-black mt-2 text-gray-900 dark:text-white">
                                    {formatCurrency(selectedTx.amount_cents)}
                                </p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize mt-2.5 ${
                                    selectedTx.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                                        : selectedTx.status === "failed" || selectedTx.status === "reversed"
                                            ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                                            : "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400"
                                }`}>
                                    {selectedTx.status}
                                </span>
                            </DialogHeader>

                            <div className="space-y-4 border-t border-gray-100 dark:border-[#2A2A2A] pt-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-semibold">Transaction ID</span>
                                    <div className="flex items-center gap-1.5">
                                        <code className="font-mono font-bold text-gray-800 dark:text-gray-200">{selectedTx.id.toUpperCase()}</code>
                                        <button 
                                            onClick={() => handleCopy(selectedTx.id)}
                                            className="text-gray-400 hover:text-[#C69C2E] transition-colors"
                                        >
                                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-semibold">Reference</span>
                                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{selectedTx.reference || "N/A"}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-semibold">Date & Time</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{formatDate(selectedTx.created_at)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setSelectedTx(null)}
                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-bold text-sm mt-8"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
