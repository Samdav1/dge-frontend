"use client";

import { useState, useEffect } from "react";

interface DriverItem {
    id: string;
    user_id: string;
    name: string;
    email: string;
    license_number: string;
    license_status: string;
    submitted_at: string;
}

interface VerifiedTabProps {
    onReviewClick: (item: DriverItem) => void;
}

export default function VerifiedTab({ onReviewClick }: VerifiedTabProps) {
    const [items, setItems] = useState<DriverItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLicenses = async () => {
        try {
            const res = await fetch("/api/admin/drivers/licenses?status=verified");
            const data = await res.json();
            if (data.items) setItems(data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between overflow-x-auto select-none relative animate-fade-in mt-4 min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <table className="w-full text-left border-collapse select-none">
                <thead>
                    <tr className="border-b border-slate-50 select-none">
                        <th className="py-3 px-2 w-10">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-amber-600 bg-white" />
                        </th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">License Number</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified At</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.length > 0 ? items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors select-none" onClick={() => onReviewClick(item)}>
                            <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-amber-600 bg-white" />
                            </td>
                            <td className="py-4 px-2 text-xs font-semibold text-slate-800 leading-tight">{item.name}</td>
                            <td className="py-4 px-2 text-xs text-slate-400 font-medium">{item.email}</td>
                            <td className="py-4 px-2 text-xs text-slate-500 font-medium">{item.license_number}</td>
                            <td className="py-4 px-2 text-xs text-slate-400 font-medium">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "N/A"}</td>
                            <td className="py-4 px-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                                    {item.license_status}
                                </span>
                            </td>
                            <td className="py-4 px-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onReviewClick(item)}
                                    className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] text-slate-600 hover:text-slate-800 transition-all shadow-sm"
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    )) : !loading && (
                        <tr><td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic font-medium">No verified drivers found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
