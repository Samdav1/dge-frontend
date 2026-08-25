"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, RefreshCw } from "lucide-react";
import { useStatusModal } from "../../components/StatusModalProvider";
import EscrowDetailModal from "./EscrowDetailModal";

interface EscrowItem {
    id: string;
    service_name: string;
    payer_name: string;
    payee_name: string;
    amount: string;
    status: string;
    created_at: string;
}

interface DisputedEscrowsTabProps {
    onEscrowClick: (escrow: EscrowItem) => void;
    search?: string;
}

export default function DisputedEscrowsTab({ onEscrowClick, search }: DisputedEscrowsTabProps) {
    const [items, setItems] = useState<EscrowItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
    const { showModal, hideModal } = useStatusModal();

    const fetchEscrows = async () => {
        setLoading(true);
        try {
            const url = new URL("/api/admin/escrows", window.location.origin);
            url.searchParams.append("status", "disputed");
            if (search) url.searchParams.append("search", search);
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.items) setItems(data.items);
        } catch (err) {
            console.error("Failed to fetch disputed escrows:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEscrows();
    }, [search]);

    const toggleMenu = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (activeMenu === id) {
            setActiveMenu(null);
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX - 140
            });
            setActiveMenu(id);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        showModal({
            type: "confirm",
            title: "Resolve Disputed Escrow",
            message: `Are you sure you want to resolve this dispute by setting the status to ${newStatus.toUpperCase()}? This will process financial ledger updates.`,
            onConfirm: async () => {
                hideModal();
                try {
                    const res = await fetch(`/api/admin/escrows/${id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                    });
                    if (res.ok) {
                        setItems(items.filter(it => it.id !== id));
                        showModal({
                            type: "success",
                            title: "Dispute Resolved",
                            message: `Disputed escrow has been successfully ${newStatus === "released" ? "released to payee" : "refunded to payer"}.`
                        });
                    } else {
                        const err = await res.json();
                        showModal({
                            type: "error",
                            title: "Resolution Failed",
                            message: err.detail || "Failed to update escrow status"
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
        setActiveMenu(null);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between overflow-x-auto select-none relative animate-fade-in mt-4 min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <table className="w-full text-left border-collapse select-none">
                <thead>
                    <tr className="border-b border-slate-50 select-none">
                        <th className="py-3 px-2 w-10">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-red-600 bg-white" />
                        </th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Name</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payer</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payee</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="py-3 px-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.length > 0 ? items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 cursor-pointer transition-colors select-none" onClick={() => onEscrowClick(item)}>
                            <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-red-600 bg-white" />
                            </td>
                            <td className="py-4 px-2 text-xs font-semibold text-slate-800 leading-tight max-w-[180px] truncate">{item.service_name}</td>
                            <td className="py-4 px-2 text-xs text-slate-400 font-medium">{item.payer_name}</td>
                            <td className="py-4 px-2 text-xs text-slate-400 font-medium">{item.payee_name}</td>
                            <td className="py-4 px-2 text-xs text-slate-500 font-bold">{item.amount}</td>
                            <td className="py-4 px-2 text-xs text-slate-400 font-medium">{item.created_at}</td>
                            <td className="py-4 px-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] bg-red-50 text-red-600 border border-red-100 uppercase">
                                    {item.status}
                                </span>
                            </td>
                            <td className="py-4 px-2 text-slate-400 relative">
                                <button 
                                    onClick={(e) => toggleMenu(item.id, e)}
                                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            </td>
                        </tr>
                    )) : !loading && (
                        <tr><td colSpan={8} className="py-12 text-center text-slate-400 text-xs italic font-medium">No disputed escrows found.</td></tr>
                    )}
                </tbody>
            </table>

            {/* Fixed Positioned Popups */}
            {activeMenu !== null && (
                <div 
                    className="fixed bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-[100] flex flex-col select-none animate-in fade-in zoom-in-95 duration-100 w-44"
                    style={{ 
                        top: `${menuPos.top - window.scrollY}px`, 
                        left: `${menuPos.left - window.scrollX}px` 
                    }}
                >
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenu && activeMenu !== "undefined") {
                                setSelectedEscrowId(activeMenu);
                            }
                            setActiveMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                        <Eye size={14} className="text-blue-500" /> View Total Info
                    </button>
                    <div className="border-t border-slate-50 my-1 pt-1">
                        <span className="px-3 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">Resolve Dispute</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(activeMenu, "released");
                            }}
                            className="w-full px-3 py-2 text-left text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Release to Payee
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(activeMenu, "refunded");
                            }}
                            className="w-full px-3 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Refund to Payer
                        </button>
                    </div>
                </div>
            )}

            {/* Escrow Detail Modal */}
            {selectedEscrowId && (
                <EscrowDetailModal 
                    escrowId={selectedEscrowId} 
                    onClose={() => setSelectedEscrowId(null)} 
                />
            )}
        </div>
    );
}
