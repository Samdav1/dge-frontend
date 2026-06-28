"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
    Briefcase, Calendar, Tag, User, MapPin,
    Loader2, AlertCircle, ArrowLeft, ExternalLink,
    CheckCircle2, XCircle, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]",
    ASSIGNED: "bg-blue-50 text-blue-600 border border-blue-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    CANCELLED: "bg-red-50 text-red-600 border border-red-100",
};

export default function PostedJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        async function fetchJob() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/posted-jobs/${id}`);
                if (!res.ok) throw new Error("Failed to fetch job details");
                const data = await res.json();
                setJob(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchJob();
    }, [id]);

    const handleStatusUpdate = async (status: string) => {
        if (!confirm(`Are you sure you want to change this job's status to ${status}?`)) return;
        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/posted-jobs/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: id, status })
            });
            if (res.ok) {
                if (status === "DELETE") {
                    router.push("/admin/overview");
                } else {
                    const updatedRes = await fetch(`/api/admin/posted-jobs/${id}`);
                    if (updatedRes.ok) {
                        setJob(await updatedRes.json());
                    }
                }
            } else {
                const err = await res.text();
                alert(`Error: ${err}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#fafafa]">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#b68512]" />
                </main>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex h-screen bg-[#fafafa]">
                <AdminSidebar />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <AlertCircle size={48} className="text-red-400" />
                    <p className="text-slate-600 font-medium">{error || "Posted Job not found"}</p>
                    <Link href="/admin/overview" className="text-amber-600 font-bold hover:underline">Back to Overview</Link>
                </main>
            </div>
        );
    }

    const status = (job.status || "OPEN").toUpperCase();

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa]">
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <Briefcase size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none truncate">
                            Posted Job Details / {job.title}
                        </h1>
                    </div>
                </header>

                <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-[1200px] mx-auto w-full animate-fade-in">
                    <Link
                        href="/admin/overview"
                        className="px-3 py-1 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 shadow-sm transition-all flex items-center gap-1 w-fit leading-none mb-2"
                    >
                        ← Back to Overview
                    </Link>

                    {/* Main Job Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden">
                        {/* Hero Image */}
                        <div className="relative h-64 sm:h-80 bg-slate-100 overflow-hidden">
                            {job.image ? (
                                <img
                                    src={job.image.startsWith('http') ? job.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${job.image}`}
                                    alt={job.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <Briefcase size={64} className="mb-2 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-30">No Image Provided</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${STATUS_STYLES[status] || STATUS_STYLES.OPEN}`}>
                                            {status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Posted Job Request</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{job.title}</h2>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Tag size={14} className="text-[#b68512]" />
                                        <span>Category: {job.category?.name || "General"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Calendar size={14} className="text-[#b68512]" />
                                        <span>Posted on {job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Briefcase size={14} className="text-[#b68512]" />
                                        <span>{job.bid_count || 0} Bid Bids/Negotiations</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 justify-center">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Budget Range</span>
                                    <span className="text-2xl font-bold text-slate-800 tracking-tighter">
                                        ₦{(job.min_price_cents / 100).toLocaleString()} - ₦{(job.max_price_cents / 100).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={actionLoading}
                                        onClick={() => handleStatusUpdate("CANCELLED")}
                                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs shadow-sm hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        Cancel Job
                                    </button>
                                    <button 
                                        disabled={actionLoading}
                                        onClick={() => handleStatusUpdate("DELETE")}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        Delete Job
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                            <div className="p-8 md:col-span-2 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Job Description</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                        {job.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 bg-slate-50/30">
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Poster Information</h3>
                                {job.user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-700 text-lg shadow-sm overflow-hidden">
                                                {job.user.username?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-sm font-bold text-slate-800">{job.user.username}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold">User ID: {job.user_id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/admin/users/${job.user_id}`}
                                            className="flex items-center justify-between w-full p-3 bg-white border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                                        >
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700">View Poster Profile</span>
                                            <ExternalLink size={14} className="text-slate-300 group-hover:text-amber-500" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                                        <User size={24} className="mb-2 opacity-20" />
                                        <span className="text-xs font-medium">No user data</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Posted Job ID</span>
                                        <span className="text-slate-700 font-bold font-mono">{job.id.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Status</span>
                                        <span className="text-slate-700 font-bold">{job.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
