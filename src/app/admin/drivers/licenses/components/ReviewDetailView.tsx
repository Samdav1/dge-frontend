"use client";

import { useState, useEffect } from "react";
import { Eye, Download, FileText, Mail, Check, X, Shield, Car, Calendar, CreditCard } from "lucide-react";

interface ReviewDetailViewProps {
    driverId: string;
    onBack: () => void;
}

export default function ReviewDetailView({ driverId, onBack }: ReviewDetailViewProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/drivers/licenses/${driverId}`);
            const d = await res.json();
            setData(d);
        } catch (err) {
            console.error("Failed to fetch driver license detail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (driverId) fetchDetail();
    }, [driverId]);

    const handleAction = async (action: "approve" | "reject") => {
        if (action === "reject" && !rejectReason) {
            setShowRejectInput(true);
            return;
        }
        
        try {
            const res = await fetch(`/api/admin/drivers/licenses/${driverId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, rejection_reason: rejectReason }),
            });
            if (res.ok) {
                fetchDetail(); // Refresh data
                if (action === "approve") alert("Driver License Approved!");
                else {
                    alert("Driver License Rejected.");
                    setShowRejectInput(false);
                    setRejectReason("");
                }
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to process driver license review"}`);
            }
        } catch (err) {
            console.error("Driver license action error:", err);
        }
    };

    if (loading) return <div className="h-96 bg-white rounded-2xl animate-pulse mt-8"></div>;

    const name = data?.name || "Driver";

    const formatImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        return `${BASE_URL.replace('0.0.0.0', '127.0.0.1')}${url}`;
    };

    return (
        <div className="space-y-6 flex-1 flex flex-col select-none animate-fade-in pt-2">
            <button
                onClick={onBack}
                className="px-3 py-1 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 shadow-sm transition-all flex items-center gap-1 leading-none mb-2 w-fit"
            >
                ← Back to License List
            </button>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-slate-50 border-4 border-amber-100 rounded-full flex items-center justify-center font-bold text-slate-700 text-xl overflow-hidden shadow-md">
                        {name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs font-semibold text-amber-600 tracking-tight leading-none mb-1.5 uppercase">Driver Application</span>
                        <span className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1.5">{name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold leading-none">
                            Submitted On {data?.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : "—"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {data?.license_status === "pending" ? (
                        <>
                            <button 
                                onClick={() => handleAction("approve")}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <Check size={14} /> Approve License
                            </button>
                            <button 
                                onClick={() => setShowRejectInput(!showRejectInput)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <X size={14} /> Reject License
                            </button>
                        </>
                    ) : (
                        <span className={`px-4 py-2 rounded-xl font-bold text-[11px] border capitalize ${
                            data?.license_status === "verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                            STATUS: {data?.license_status}
                        </span>
                    )}
                </div>
            </div>

            {showRejectInput && (
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Reason for Rejection</label>
                    <textarea 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:border-red-500/50 min-h-[80px]"
                        placeholder="Explain why the driver's license was rejected..."
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button onClick={() => setShowRejectInput(false)} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                        <button onClick={() => handleAction("reject")} className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg">Confirm Rejection</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 select-none animate-fade-in">
                {/* Details Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4 select-none">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5 uppercase flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-amber-500" /> Driver & Vehicle Profile
                    </h4>
                    <div className="space-y-4 pt-1 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Full Name</span>
                                <span className="font-bold text-xs text-slate-800">{name}</span>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Email Address</span>
                                <span className="font-bold text-xs text-slate-800">{data?.email}</span>
                            </div>
                        </div>

                        <hr className="border-slate-50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">License Number</span>
                                <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {data?.license_number || "N/A"}
                                </span>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Vehicle Type</span>
                                <span className="font-bold text-xs text-slate-800 capitalize flex items-center gap-1">
                                    <Car className="w-3.5 h-3.5 text-slate-400" /> {data?.vehicle_type || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Car Make & Model</span>
                                <span className="font-bold text-xs text-slate-800">{data?.car_name} {data?.car_model}</span>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Plate Number</span>
                                <span className="font-bold text-xs text-slate-800 uppercase">{data?.plate_number}</span>
                            </div>
                        </div>

                        {data?.license_rejection_reason && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1 block">Previous Rejection Reason</span>
                                <p className="text-xs text-red-700 font-medium">{data.license_rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Media uploads */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-6 select-none">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight border-b border-slate-50 pb-2.5 uppercase flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-500" /> Verification Media
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Driver License Photo */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Driver's License Photo</span>
                            {data?.license_picture_url ? (
                                <div className="relative border border-slate-100 rounded-xl overflow-hidden shadow-sm aspect-video bg-slate-50">
                                    <img 
                                        src={formatImageUrl(data.license_picture_url)} 
                                        alt="Driver License" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                        <a 
                                            href={formatImageUrl(data.license_picture_url)} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg shadow-md transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 italic text-xs">
                                    No license picture uploaded
                                </div>
                            )}
                        </div>

                        {/* Vehicle Photo */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Vehicle Photo</span>
                            {data?.car_picture_url ? (
                                <div className="relative border border-slate-100 rounded-xl overflow-hidden shadow-sm aspect-video bg-slate-50">
                                    <img 
                                        src={formatImageUrl(data.car_picture_url)} 
                                        alt="Vehicle" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                        <a 
                                            href={formatImageUrl(data.car_picture_url)} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg shadow-md transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 italic text-xs">
                                    No vehicle picture uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
