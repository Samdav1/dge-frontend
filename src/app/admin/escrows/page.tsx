"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
    Wallet,
    Search,
    ChevronDown
} from "lucide-react";

import AllEscrowsTab from "./components/AllEscrowsTab";
import ActiveEscrowsTab from "./components/ActiveEscrowsTab";
import CompletedEscrowsTab from "./components/CompletedEscrowsTab";
import RefundedEscrowsTab from "./components/RefundedEscrowsTab";
import DisputedEscrowsTab from "./components/DisputedEscrowsTab";
import EscrowDetailView from "./components/EscrowDetailView";

type TabType = "All" | "Active" | "Completed" | "Refunded" | "Disputed";

export default function AdminEscrowsPage() {
    const [selectedTab, setSelectedTab] = useState<TabType>("All");
    const [selectedEscrow, setSelectedEscrow] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [summary, setSummary] = useState({ held: 0, released: 0, refunded: 0, disputed: 0 });

    const handleExportCSV = async () => {
        try {
            const statusMap: Record<string, string> = {
                "All": "all",
                "Active": "held",
                "Completed": "released",
                "Refunded": "refunded",
                "Disputed": "disputed"
            };
            const status = statusMap[selectedTab] || "all";
            const url = new URL("/api/admin/escrows", window.location.origin);
            url.searchParams.append("status", status);
            url.searchParams.append("limit", "1000");
            if (searchQuery) url.searchParams.append("search", searchQuery);

            const res = await fetch(url.toString());
            const data = await res.json();
            if (!data.items || data.items.length === 0) return;

            const headers = ["Service", "Payer", "Payee", "Amount", "Status", "Date"];
            const rows = data.items.map((it: any) => [
                it.service_name, it.payer_name, it.payee_name, it.amount, it.status, it.created_at
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((r: any) => r.map((cell: any) => `"${cell}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const hrefUrl = URL.createObjectURL(blob);
            link.setAttribute("href", hrefUrl);
            link.setAttribute("download", `escrows_${selectedTab.toLowerCase()}_export_${new Date().toISOString().split("T")[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export escrows:", err);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await fetch("/api/admin/escrows?limit=1");
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
            }
        } catch (err) {
            console.error("Failed to fetch escrows summary:", err);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const totalEscrowsCount = summary.held + summary.released + summary.refunded + summary.disputed;

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[50%] xs:max-w-none">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <Wallet size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none truncate select-none">
                            Escrow Management {selectedEscrow ? `/ ${selectedEscrow.id.slice(0,8)}` : ""}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 hover:bg-slate-50 cursor-pointer rounded-xl px-2 py-1.5 transition-colors select-none">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm border border-slate-200 shrink-0">
                                NC
                            </div>
                            <div className="flex flex-col select-none hidden sm:flex">
                                <span className="font-semibold text-xs text-slate-800 leading-tight">Admin</span>
                                <span className="text-[10px] text-slate-400 font-medium">superadmin</span>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 ml-1 hidden sm:block" />
                        </div>
                    </div>
                </header>

                {!selectedEscrow ? (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full max-w-sm select-none">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Transaction, Username, Service..."
                                    className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleExportCSV}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-[11px] text-slate-600 hover:bg-slate-50 select-none shadow-sm transition-all flex items-center gap-1"
                                >
                                    <ChevronDown size={13} className="text-slate-400 rotate-180" /> Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 select-none">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Active")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Funds Held</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.held.toLocaleString()}</span>
                                    <span className="text-[11px] text-amber-600 font-bold leading-tight mt-2 flex items-center gap-1">In Escrow</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Completed")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Total Released</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.released.toLocaleString()}</span>
                                    <span className="text-[11px] text-emerald-600 font-bold leading-tight mt-2 flex items-center gap-1">↑ Success</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Refunded")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Refunded</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.refunded.toLocaleString()}</span>
                                    <span className="text-[11px] text-blue-600 font-bold leading-tight mt-2 flex items-center gap-1">Returned Funds</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Disputed")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Disputed</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.disputed.toLocaleString()}</span>
                                    <span className="text-[11px] text-red-600 font-bold leading-tight mt-2 flex items-center gap-1">Requires Attention</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col select-none leading-tight">
                            <h2 className="text-sm font-bold tracking-tight text-slate-800">Escrow Records</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and audit funds held in the platform escrow</p>
                        </div>

                        <div className="flex items-center gap-2 border-b border-slate-100 select-none w-full overflow-x-auto whitespace-nowrap flex-nowrap pb-0.5">
                            <button
                                onClick={() => setSelectedTab("All")}
                                className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                    selectedTab === "All" ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                All ({totalEscrowsCount})
                            </button>
                            <button
                                onClick={() => setSelectedTab("Active")}
                                className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                    selectedTab === "Active" ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Active ({summary.held})
                            </button>
                            <button
                                onClick={() => setSelectedTab("Completed")}
                                className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                    selectedTab === "Completed" ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Completed ({summary.released})
                            </button>
                            <button
                                onClick={() => setSelectedTab("Refunded")}
                                className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                    selectedTab === "Refunded" ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Refunded ({summary.refunded})
                            </button>
                            <button
                                onClick={() => setSelectedTab("Disputed")}
                                className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                    selectedTab === "Disputed" ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Disputed ({summary.disputed})
                            </button>
                        </div>

                        {selectedTab === "All" && <AllEscrowsTab onEscrowClick={setSelectedEscrow} search={searchQuery} />}
                        {selectedTab === "Active" && <ActiveEscrowsTab onEscrowClick={setSelectedEscrow} search={searchQuery} />}
                        {selectedTab === "Completed" && <CompletedEscrowsTab onEscrowClick={setSelectedEscrow} search={searchQuery} />}
                        {selectedTab === "Refunded" && <RefundedEscrowsTab onEscrowClick={setSelectedEscrow} search={searchQuery} />}
                        {selectedTab === "Disputed" && <DisputedEscrowsTab onEscrowClick={setSelectedEscrow} search={searchQuery} />}
                    </div>
                ) : (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full animate-fade-in relative">
                        <EscrowDetailView item={selectedEscrow} onBack={() => setSelectedEscrow(null)} />
                    </div>
                )}
            </main>
        </div>
    );
}
