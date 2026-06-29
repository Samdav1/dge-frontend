"use client";

import React from "react";
import { TransactionList } from "@/features/wallet/components/TransactionList";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-100px)]">
            {/* Header / Breadcrumb navigation */}
            <div className="flex flex-col gap-2 mb-6">
                <Link
                    href="/dashboard/wallet"
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#C69C2E] transition-colors self-start group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Wallet
                </Link>
                <div className="flex flex-row items-center justify-between mt-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Transactions</h1>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>Home</span>
                        <span>/</span>
                        <span>Wallet</span>
                        <span>/</span>
                        <span className="text-[#C69C2E]">Transactions</span>
                    </div>
                </div>
            </div>

            {/* Render the full TransactionList with filters enabled */}
            <TransactionList showFilters={true} />
        </div>
    );
}
