"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { 
    TrendingUp, 
    Wallet, 
    ChevronDown, 
    Loader2, 
    RefreshCw, 
    ArrowUpRight, 
    ShieldCheck, 
    CheckCircle2, 
    DollarSign,
    Filter,
    FileText,
    PieChart,
    Settings
} from "lucide-react";
import Link from "next/link";

export default function AdminRevenuePage() {
    const [revenueLogs, setRevenueLogs] = useState<any[]>([]);
    const [revenueStats, setRevenueStats] = useState<any>({
        total_all_time_formatted: "₦0.00",
        total_this_month_formatted: "₦0.00",
        total_today_formatted: "₦0.00",
        total_escrow_revenue_formatted: "₦0.00",
        total_deposit_revenue_formatted: "₦0.00",
        total_withdrawal_revenue_formatted: "₦0.00",
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [eventTypeFilter, setEventTypeFilter] = useState("");

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/revenue?page=${page}&limit=50`;
            if (eventTypeFilter) {
                url += `&event_type=${eventTypeFilter}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setRevenueLogs(data.revenue_logs || []);
                setTotalCount(data.total_count || 0);
                if (data.stats) {
                    setRevenueStats(data.stats);
                }
            }
        } catch (err) {
            console.error("Failed to fetch platform revenue:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, [page, eventTypeFilter]);

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                {/* Header */}
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[50%] xs:max-w-none">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <TrendingUp size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none truncate select-none">
                            Platform Revenue & Earnings
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin/payments" 
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Settings size={14} /> Configure Fee Rules
                        </Link>

                        <div className="flex items-center gap-3 hover:bg-slate-50 cursor-pointer rounded-xl px-2 py-1.5 transition-colors select-none border border-slate-100">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                AD
                            </div>
                            <div className="flex flex-col select-none hidden sm:flex">
                                <span className="font-semibold text-xs text-slate-800 leading-tight">Admin</span>
                                <span className="text-[10px] text-slate-400 font-medium">superadmin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full flex-1 overflow-y-auto">
                    {/* Top Revenue Summary Header */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Executive Summary</span>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Platform Earnings Overview</h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Comprehensive real-time tracking of platform commissions from escrow releases, deposit surcharges, and withdrawal fees.
                            </p>
                        </div>
                        <button 
                            onClick={fetchRevenueData}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all w-fit cursor-pointer"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Earnings
                        </button>
                    </div>

                    {/* Stats Grid - 6 Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 select-none">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings (All-Time)</span>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{revenueStats.total_all_time_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <ArrowUpRight size={12} /> Cumulative revenue
                            </span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</span>
                            <h3 className="text-xl font-bold text-[#b68512] tracking-tight">{revenueStats.total_this_month_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-amber-600 font-bold">Current billing cycle</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
                            <h3 className="text-xl font-bold text-emerald-600 tracking-tight">{revenueStats.total_today_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-emerald-600 font-bold">24-hour revenue</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escrow Commissions</span>
                            <h3 className="text-xl font-bold text-blue-600 tracking-tight">{revenueStats.total_escrow_revenue_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-blue-600 font-bold">Escrow release fees</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposit Fees</span>
                            <h3 className="text-xl font-bold text-purple-600 tracking-tight">{revenueStats.total_deposit_revenue_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-purple-600 font-bold">Surcharges</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[110px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Withdrawal Fees</span>
                            <h3 className="text-xl font-bold text-slate-700 tracking-tight">{revenueStats.total_withdrawal_revenue_formatted || "₦0.00"}</h3>
                            <span className="text-[10px] text-slate-500 font-bold">Payout fees</span>
                        </div>
                    </div>

                    {/* Log Table Container */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col">
                        {/* Filter Bar */}
                        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Filter size={15} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Channel:</span>
                                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                    <button 
                                        type="button"
                                        onClick={() => { setEventTypeFilter(""); setPage(1); }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventTypeFilter === "" ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        All Channels
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setEventTypeFilter("escrow_release"); setPage(1); }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventTypeFilter === "escrow_release" ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Escrow Fees
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setEventTypeFilter("deposit"); setPage(1); }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventTypeFilter === "deposit" ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Deposit Surcharges
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setEventTypeFilter("withdrawal"); setPage(1); }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventTypeFilter === "withdrawal" ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Withdrawal Fees
                                    </button>
                                </div>
                            </div>

                            <span className="text-xs text-slate-400 font-semibold">
                                Total Revenue Logs: <strong className="text-slate-700">{totalCount}</strong>
                            </span>
                        </div>

                        {/* Revenue Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse select-none">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/30">
                                        <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">User / Account</th>
                                        <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Channel / Event</th>
                                        <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Transaction</th>
                                        <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Fee Rate</th>
                                        <th className="py-3.5 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Platform Earned</th>
                                        <th className="py-3.5 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="h-48 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
                                                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                                                    Fetching platform revenue logs...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : revenueLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <Wallet className="w-10 h-10 opacity-20" />
                                                    <p className="text-xs font-semibold">No revenue records found for this channel</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        revenueLogs.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs text-slate-800">{log.user_name || "Platform User"}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold">{log.user_email || "N/A"}</span>
                                                        <span className="text-[9px] font-mono text-slate-400 mt-0.5">Ref: {log.reference}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {log.event_type === "escrow_release" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase">
                                                            Escrow Release Fee
                                                        </span>
                                                    )}
                                                    {log.event_type === "deposit" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 uppercase">
                                                            Deposit Surcharge
                                                        </span>
                                                    )}
                                                    {log.event_type === "withdrawal" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                                                            Withdrawal Fee
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-xs font-bold text-slate-700">{log.gross_amount}</td>
                                                <td className="py-4 px-4 text-xs font-semibold text-slate-500">
                                                    {log.fee_type === "percentage" ? `${log.fee_value}%` : `₦${(log.fee_value / 100).toLocaleString()}`}
                                                </td>
                                                <td className="py-4 px-4 text-xs font-extrabold text-emerald-600">{log.fee_amount}</td>
                                                <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                                                    {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalCount > 50 && (
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:bg-slate-100 cursor-pointer"
                                >
                                    Previous Page
                                </button>
                                <span className="text-xs text-slate-500 font-bold">
                                    Page {page} of {Math.ceil(totalCount / 50)}
                                </span>
                                <button
                                    disabled={page * 50 >= totalCount}
                                    onClick={() => setPage(page + 1)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:bg-slate-100 cursor-pointer"
                                >
                                    Next Page
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
