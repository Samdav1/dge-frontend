"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { FileCheck, Search, ChevronDown } from "lucide-react";

import PendingTab from "./components/PendingTab";
import VerifiedTab from "./components/VerifiedTab";
import RejectedTab from "./components/RejectedTab";
import ReviewDetailView from "./components/ReviewDetailView";

type TabType = "Pending" | "Verified" | "Rejected";

export default function AdminDriverLicensesPage() {
    const [selectedTab, setSelectedTab] = useState<TabType>("Pending");
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [summary, setSummary] = useState({ pending: 0, verified: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    const fetchSummary = async () => {
        try {
            const res = await fetch("/api/admin/drivers/licenses?limit=1");
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Failed to fetch driver license summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await fetch(`/api/admin/drivers/licenses?status=${selectedTab.toLowerCase()}&limit=1000`);
            const data = await res.json();
            if (!data.items || data.items.length === 0) return;

            const headers = ["Name", "Email", "License Number", "Submitted At", "Status"];
            const rows = data.items.map((it: any) => [
                it.name, it.email, it.license_number, it.submitted_at, it.license_status
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((r: any) => r.map((cell: any) => `"${cell || ""}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `driver_licenses_${selectedTab.toLowerCase()}_export_${new Date().toISOString().split("T")[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export driver licenses:", err);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const totalReviews = summary.pending + summary.verified + summary.rejected;
    const rejectionRate = totalReviews > 0 ? ((summary.rejected / totalReviews) * 100).toFixed(1) : "0";

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[50%] xs:max-w-none">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <FileCheck size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none truncate select-none">
                            Driver Licenses {selectedReview ? `/ ${selectedReview.name || "Review"}` : ""}
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

                {!selectedReview ? (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full max-w-sm select-none">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Anything"
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Pending")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Pending Reviews</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.pending.toLocaleString()}</span>
                                    <span className="text-[11px] text-amber-600 font-bold leading-tight mt-2 flex items-center gap-1">Action Required</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Verified")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Verified Drivers</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{summary.verified.toLocaleString()}</span>
                                    <span className="text-[11px] text-emerald-600 font-bold leading-tight mt-2 flex items-center gap-1">↑ Approved</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[135px] hover:scale-[1.01] transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.01)]" onClick={() => setSelectedTab("Rejected")}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Rejection Rate</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-2xl font-bold tracking-tight text-slate-800">{rejectionRate}%</span>
                                    <span className="text-[11px] text-red-600 font-bold leading-tight mt-2 flex items-center gap-1">{summary.rejected} Total Rejected</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col select-none leading-tight">
                            <h2 className="text-sm font-bold tracking-tight text-slate-800">Driver License Submissions</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Review and approve driver licenses and credentials</p>
                        </div>

                        <div className="flex items-center gap-2 border-b border-slate-100 select-none w-full overflow-x-auto whitespace-nowrap flex-nowrap pb-0.5">
                            {(["Pending", "Verified", "Rejected"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-3.5 pb-2 text-xs font-bold transition-all relative leading-none border-b-2 shrink-0 ${
                                        selectedTab === tab ? "border-[#b68512] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
                                    }`}
                                >
                                    {tab} ({summary[tab.toLowerCase() as keyof typeof summary] || 0})
                                </button>
                            ))}
                        </div>

                        {selectedTab === "Pending" && <PendingTab onReviewClick={setSelectedReview} />}
                        {selectedTab === "Verified" && <VerifiedTab onReviewClick={setSelectedReview} />}
                        {selectedTab === "Rejected" && <RejectedTab onReviewClick={setSelectedReview} />}
                    </div>
                ) : (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full animate-fade-in relative">
                        <ReviewDetailView 
                            driverId={selectedReview.id} 
                            onBack={() => {
                                setSelectedReview(null);
                                fetchSummary(); // Refresh counts
                            }} 
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
