"use client";

import { useState, useEffect, use } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
    Briefcase, Calendar, Tag, User, MapPin,
    Loader2, AlertCircle, ArrowLeft, ExternalLink,
    CheckCircle2, XCircle, MoreHorizontal
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    DRAFT: "bg-slate-50 text-slate-400 border border-slate-100",
    "IN PROGRESS": "bg-amber-50 text-amber-600 border border-amber-100",
    CANCELLED: "bg-red-50 text-red-600 border border-red-100",
};

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchService() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/services/${id}`);
                if (!res.ok) throw new Error("Failed to fetch service details");
                const data = await res.json();
                setService(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchService();
    }, [id]);

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

    if (error || !service) {
        return (
            <div className="flex h-screen bg-[#fafafa]">
                <AdminSidebar />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <AlertCircle size={48} className="text-red-400" />
                    <p className="text-slate-600 font-medium">{error || "Service not found"}</p>
                    <Link href="/admin/overview" className="text-amber-600 font-bold hover:underline">Back to Overview</Link>
                </main>
            </div>
        );
    }

    const serviceData = service?.service;
    const userData = service?.user;
    const status = (serviceData?.status?.value || serviceData?.status || "DRAFT").toUpperCase();

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
                            Service Details / {serviceData?.name}
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

                    {/* Main Service Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden">
                        {/* Service Hero Image */}
                        <div className="relative h-64 sm:h-80 bg-slate-100 overflow-hidden">
                            {serviceData?.image ? (
                                <img
                                    src={serviceData.image.startsWith('http') ? serviceData.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${serviceData.image}`}
                                    alt={serviceData.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <Briefcase size={64} className="mb-2 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-30">No Service Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
                                            {status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Listed Service</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{serviceData?.name}</h2>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Tag size={14} className="text-[#b68512]" />
                                        <span>{serviceData?.type?.value || serviceData?.type || "Remote"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Briefcase size={14} className="text-[#b68512]" />
                                        <span>{serviceData?.categories?.[0]?.name || "Uncategorized"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <Calendar size={14} className="text-[#b68512]" />
                                        <span>Listed on {serviceData?.created_at ? new Date(serviceData.created_at).toLocaleDateString() : "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <MapPin size={14} className="text-[#b68512]" />
                                        <span>Global / Online</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 justify-center">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Service Price</span>
                                    <span className="text-3xl font-bold text-slate-800 tracking-tighter">₦{(serviceData?.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-[#b68512] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-[#9a710f] transition-all">
                                        Manage Service
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                            <div className="p-8 md:col-span-2 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Description</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {serviceData?.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Keywords & Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(serviceData?.keywords?.split(",") || ["Service", "Admin", "Marketplace"]).map((tag: string) => (
                                            <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 bg-slate-50/30">
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Provider Information</h3>
                                {userData ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-700 text-lg shadow-sm overflow-hidden">
                                                {userData.user_picture ? (
                                                    <img
                                                        src={userData.user_picture.startsWith('http') ? userData.user_picture : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${userData.user_picture}`}
                                                        alt={userData.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    userData.username?.[0]?.toUpperCase() || "U"
                                                )}
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-sm font-bold text-slate-800">{userData.username}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold">{userData.email}</span>
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/admin/users/${userData.id}`}
                                            className="flex items-center justify-between w-full p-3 bg-white border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                                        >
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700">View Full Profile</span>
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
                                        <span className="text-slate-400 font-medium">Service ID</span>
                                        <span className="text-slate-700 font-bold font-mono">{serviceData?.id.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Views</span>
                                        <span className="text-slate-700 font-bold">124</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Ongoing Orders</span>
                                        <span className="text-slate-700 font-bold">2</span>
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
