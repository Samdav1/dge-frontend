"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { getUserTransactions } from "../actions";
import { Loader2 } from "lucide-react";

export function TransactionList() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-8 flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-[#C69C2E]" />
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden mt-[20px] shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Transactions</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-[#1A1A1A]/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A]/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{tx.id.substring(0, 8).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(tx.amount_cents)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{tx.type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.created_at)}</td>
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
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#C69C2E] dark:hover:text-[#C69C2E]">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
