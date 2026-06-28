"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Loader2, AlertCircle, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface Service {
    id: string;
    title: string;
    type: string;
    price: string;
    date: string;
    status: string;
}

const STATUS_STYLES: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    DRAFT: "bg-slate-50 text-slate-400 border border-slate-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    "IN PROGRESS": "bg-amber-50 text-amber-600 border border-amber-100",
    CANCELLED: "bg-red-50 text-red-600 border border-red-100",
};

export default function ServicesTab({ userId }: { userId: string }) {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch(`/api/admin/platform-users/${userId}?tab=services`)
            .then((r) => r.json())
            .then((d) => setServices(Array.isArray(d) ? d : []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [userId]);

    const filtered = services.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 flex-1 flex flex-col select-none animate-fade-in pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">Services Listed</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-[#b68512] border border-amber-100">
                        {services.length} Listed
                    </span>
                </div>
            </div>

            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services…"
                    className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-slate-300"><Loader2 size={24} className="animate-spin" /></div>
                ) : error ? (
                    <div className="flex flex-col items-center py-12 gap-2"><AlertCircle size={20} className="text-red-300" /><p className="text-xs text-slate-400">{error}</p></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-2"><p className="text-xs text-slate-400">No services found</p></div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Title</th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Price</th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Listed</th>
                                <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                                <th className="py-3 px-2 w-8" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((srv) => (
                                <tr 
                                    key={srv.id} 
                                    onClick={() => router.push(`/admin/services/${srv.id}`)}
                                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                >
                                    <td className="py-4 px-2 text-xs font-bold text-slate-800 leading-none max-w-[280px] truncate">{srv.title}</td>
                                    <td className="py-4 px-2 text-xs text-slate-400 font-medium leading-none">{srv.type}</td>
                                    <td className="py-4 px-2 text-xs text-slate-500 font-semibold leading-none">{srv.price}</td>
                                    <td className="py-4 px-2 text-xs text-slate-400 font-medium leading-none">{srv.date}</td>
                                    <td className="py-4 px-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] ${STATUS_STYLES[srv.status] ?? "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                                            {srv.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
