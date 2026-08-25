"use client";
import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { getTickets, deleteTicket } from "@/features/support/actions";
import { SupportTicket, priorityToUI, statusToUI } from "@/features/support/types";
import { toast } from "sonner";

interface TicketItem {
    id: string;
    user: string;
    subject: string;
    priority: string;
    dateTime: string;
    status: string;
    rawTicket: SupportTicket;
}

interface AllTicketsTabProps {
    onViewTicket: (ticket: TicketItem) => void;
}

export default function AllTicketsTab({ onViewTicket }: AllTicketsTabProps) {
    const [selectedMenuIdx, setSelectedMenuIdx] = useState<number | null>(null);
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        const result = await getTickets();
        if (result.success && result.data) {
            const mappedTickets: TicketItem[] = result.data.map((t: any) => ({
                id: t.id.slice(0, 8).toUpperCase(), // Display partial ID or transaction ID if available
                user: t.user_name || t.user_email || "User",
                subject: t.subject,
                priority: priorityToUI(t.priority),
                dateTime: new Date(t.created_at).toLocaleString(),
                status: t.status.toUpperCase(),
                rawTicket: t
            }));
            setTickets(mappedTickets);
        } else {
            setError(result.error || "Failed to load tickets");
            toast.error(result.error || "Failed to load tickets");
        }
        setLoading(false);
    };

    const handleDelete = async (ticketId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        const result = await deleteTicket(ticketId);
        if (result.success) {
            toast.success("Ticket deleted successfully");
            fetchTickets();
        } else {
            toast.error(result.error || "Failed to delete ticket");
        }
        setSelectedMenuIdx(null);
    };

    const toggleRowMenu = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMenuIdx(selectedMenuIdx === idx ? null : idx);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading tickets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                    onClick={fetchTickets}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-x-auto select-none relative animate-fade-in mt-1 min-h-[350px]">
            <table className="w-full text-left border-collapse select-none">
                <thead>
                    <tr className="border-b border-slate-50 select-none">
                        <th className="py-3 px-2 w-10 select-none">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-amber-600 bg-white" />
                        </th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ticket ID</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">User</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Time</th>
                        <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="py-3 px-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400 text-sm font-medium">
                                No support tickets found
                            </td>
                        </tr>
                    ) : (
                        tickets.map((item, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onViewTicket(item)}
                                className="hover:bg-slate-50/50 cursor-pointer transition-colors select-none relative"
                            >
                                <td className="py-4 px-2 select-none">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-amber-600 bg-white" />
                                </td>
                                <td className="py-4 px-2 text-xs font-semibold text-slate-800 leading-tight select-none">{item.id}</td>
                                <td className="py-4 px-2 text-xs text-slate-400 font-semibold select-none leading-tight">{item.user}</td>
                                <td className="py-4 px-2 text-xs text-slate-400 font-medium select-none">{item.subject}</td>
                                <td className="py-4 px-2 text-xs text-slate-500 font-semibold select-none">{item.priority}</td>
                                <td className="py-4 px-2 text-xs text-slate-400 font-medium select-none">{item.dateTime}</td>
                                <td className="py-4 px-2 select-none">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] border leading-none ${
                                            item.status === "ATTENDED" || item.status === "RESOLVED" || item.status === "CLOSED"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-4 px-2 select-none text-slate-400 hover:text-slate-600 relative">
                                    <button
                                        onClick={(e) => toggleRowMenu(idx, e)}
                                        className="p-1 hover:bg-slate-50 rounded-lg transition-colors select-none"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {/* Action Dropdown */}
                                    {selectedMenuIdx === idx && (
                                        <div className="absolute right-0 top-12 bg-white border border-slate-100 rounded-xl shadow-xl w-[140px] p-1.5 z-40 animate-fade-in flex flex-col gap-0.5 select-none text-left">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onViewTicket(item); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all"
                                            >
                                                <Eye size={13} className="text-slate-400" />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onViewTicket(item); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all"
                                            >
                                                <MessageSquare size={13} className="text-slate-400" />
                                                <span>Reply</span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(item.rawTicket.id, e)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50/50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={13} className="text-red-400" />
                                                <span>Delete Ticket</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
