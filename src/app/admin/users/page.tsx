"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { Users as UsersIcon, Search, ChevronDown, MoreHorizontal,
    RefreshCw, Loader2, AlertCircle, XCircle, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type ToastState = { type: "success" | "error"; message: string } | null;

export interface UserItem {
    id: string;
    name: string;
    email: string;
    services: number;
    joined: string;
    joined_iso: string;
    status: "ACTIVE" | "INACTIVE" | "BANNED";
    kycStatus: "VERIFIED" | "PENDING" | "FAILED";
    email_verified: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    INACTIVE: "bg-amber-50 text-amber-600 border border-amber-100",
    BANNED: "bg-red-50 text-red-600 border border-red-100",
};
const KYC_STYLES: Record<string, string> = {
    VERIFIED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
    FAILED: "bg-red-50 text-red-600 border border-red-100",
};

export default function AdminUsersPage() {
    const router = useRouter();

    // List state
    const [users, setUsers] = useState<UserItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [statusFilterOpen, setStatusFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 50;

    // Action state
    const [toast, setToast] = useState<ToastState>(null);
    const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [kycConfirmUser, setKycConfirmUser] = useState<string | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const fetchUsers = useCallback(async (q?: string, s?: string, p?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (q) params.set("search", q);
            if (s && s !== "ALL") params.set("status", s.toLowerCase());
            params.set("page", String(p ?? page));
            params.set("limit", String(limit));

            const res = await fetch(`/api/admin/platform-users?${params}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Request failed (${res.status})`);
            }
            const data = await res.json();
            setUsers(data.users ?? []);
            setTotal(data.total ?? 0);
        } catch (err: any) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page]);

    // Initial load
    useEffect(() => { fetchUsers(search, statusFilter, 1); }, []);

    // Debounced search
    const handleSearch = (val: string) => {
        setSearch(val);
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            setPage(1);
            fetchUsers(val, statusFilter, 1);
        }, 400);
    };

    const handleStatusFilter = (val: string) => {
        setStatusFilter(val);
        setStatusFilterOpen(false);
        setPage(1);
        fetchUsers(search, val, 1);
    };

    const handleStatusAction = async (userId: string, newStatus: string) => {
        setActiveMenu(null);
        try {
            const res = await fetch(`/api/admin/platform-users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });
            if (!res.ok) throw new Error("Update failed");
            setToast({ type: "success", message: `User status updated to ${newStatus}` });
            fetchUsers(search, statusFilter, page);
        } catch (err) {
            setToast({ type: "error", message: "Failed to update user status" });
        }
    };

    const handleKycApprove = (userId: string) => {
        setActiveMenu(null);
        setKycConfirmUser(userId);
    };

    const executeKycApprove = async () => {
        if (!kycConfirmUser) return;
        const targetUserId = kycConfirmUser;
        setKycConfirmUser(null);
        try {
            const res = await fetch(`/api/admin/kyc/${targetUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve" })
            });
            if (!res.ok) throw new Error("Verification failed");
            setToast({ type: "success", message: "User KYC verified successfully" });
            fetchUsers(search, statusFilter, page);
        } catch (err) {
            setToast({ type: "error", message: "Failed to verify KYC" });
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchUsers(search, statusFilter, newPage);
    };

    const handleExportCSV = () => {
        if (users.length === 0) return;
        
        const headers = ["Name", "Email", "Services", "Date Joined", "Status", "KYC Status"];
        const rows = users.map(u => [
            u.name, u.email, u.services, u.joined, u.status, u.kycStatus
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none relative">
            <AdminSidebar />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-fade-in ${
                    toast.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                    {toast.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
                    {toast.message}
                </div>
            )}

            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                {/* Header */}
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[60%]">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <UsersIcon size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none truncate">
                            Users
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium hidden sm:block">
                            {loading ? "Loading…" : `${total} users`}
                        </span>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm border border-slate-200">
                            AD
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 space-y-5 flex-1 overflow-y-auto max-w-[1400px] mx-auto w-full animate-fade-in">
                    {/* Search + filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Status filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                                    className="px-3.5 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-500 flex items-center gap-1 shadow-sm hover:border-slate-200 transition-all"
                                >
                                    {statusFilter === "ALL" ? "Status" : statusFilter}
                                    <ChevronDown size={12} className={statusFilterOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                                </button>
                                {statusFilterOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-1 min-w-[120px]">
                                        {["ALL", "ACTIVE", "INACTIVE", "BANNED"].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleStatusFilter(opt)}
                                                className={`w-full text-left px-4 py-2 text-[11px] font-semibold hover:bg-slate-50 transition-colors ${statusFilter === opt ? "text-amber-600" : "text-slate-500"}`}
                                            >
                                                {opt === "ALL" ? "All Statuses" : opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleExportCSV}
                                disabled={loading || users.length === 0}
                                className="px-3.5 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-500 flex items-center gap-1 shadow-sm hover:border-slate-200 transition-all disabled:opacity-50"
                            >
                                Export CSV
                            </button>

                            <button
                                onClick={() => fetchUsers(search, statusFilter, page)}
                                disabled={loading}
                                className="px-3.5 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] text-slate-500 flex items-center gap-1 shadow-sm hover:border-slate-200 transition-all disabled:opacity-50"
                            >
                                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-300">
                                <Loader2 size={28} className="animate-spin" />
                                <span className="text-xs text-slate-400 font-medium">Loading users…</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <AlertCircle size={28} className="text-red-300" />
                                <p className="text-xs text-slate-400 font-medium">{error}</p>
                                <button onClick={() => fetchUsers(search, statusFilter, page)} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
                                    Try again
                                </button>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-2">
                                <UsersIcon size={28} className="text-slate-200" />
                                <p className="text-xs text-slate-400 font-medium">No users found</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">USER</th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">EMAIL ADDRESS</th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">SERVICES LISTED</th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">DATE JOINED</th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE STATUS</th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">KYC STATUS</th>
                                            <th className="py-3 px-2 w-8" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map((item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => { router.push(`/admin/users/${item.id}`); }}
                                                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-200 shrink-0">
                                                            {item.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-xs text-slate-800 leading-tight">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-xs text-slate-400 font-medium leading-none">{item.email}</td>
                                                <td className="py-4 px-2 text-xs text-slate-500 font-semibold leading-none">{item.services}</td>
                                                <td className="py-4 px-2 text-xs text-slate-400 font-medium leading-none">{item.joined}</td>
                                                <td className="py-4 px-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] ${STATUS_STYLES[item.status] ?? STATUS_STYLES.INACTIVE}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] ${KYC_STYLES[item.kycStatus] ?? KYC_STYLES.PENDING}`}>
                                                        {item.kycStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2 select-none text-slate-400 hover:text-slate-600 relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (activeMenu === item.id) {
                                                                setActiveMenu(null);
                                                            } else {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setMenuPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 110 });
                                                                setActiveMenu(item.id);
                                                            }
                                                        }}
                                                        className="focus:outline-none p-1 rounded-md hover:bg-slate-100"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Fixed Positioned User Menu */}
                                {activeMenu !== null && (
                                    <div 
                                        className="fixed bg-white border border-slate-200/80 rounded-xl shadow-lg z-[100] py-1 flex flex-col select-none w-32"
                                        style={{ top: `${menuPos.top - window.scrollY}px`, left: `${menuPos.left - window.scrollX}px` }}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusAction(activeMenu, "ACTIVE");
                                            }}
                                            className="px-3 py-1.5 text-xs text-left font-semibold hover:bg-slate-50 text-slate-700 select-none"
                                        >
                                            Activate User
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusAction(activeMenu, "BANNED");
                                            }}
                                            className="px-3 py-1.5 text-xs text-left font-semibold hover:bg-slate-50 text-slate-700 select-none"
                                        >
                                            Ban User
                                        </button>
                                        {users.find(u => u.id === activeMenu)?.kycStatus !== "VERIFIED" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleKycApprove(activeMenu);
                                                }}
                                                className="px-3 py-1.5 text-xs text-left font-semibold hover:bg-slate-50 text-[#b68512] select-none"
                                            >
                                                Approve KYC
                                            </button>
                                        )}
                                        <div className="h-px bg-slate-100 my-0.5"></div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle delete or other action
                                                setActiveMenu(null);
                                            }}
                                            className="px-3 py-1.5 text-xs text-left font-semibold hover:bg-red-50 hover:text-red-600 text-red-500 select-none"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                )}

                                {/* Pagination */}
                                <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-50">
                                    <span className="text-xs font-semibold text-slate-400">
                                        Showing {users.length} of {total}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-400">Page {page} of {totalPages}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={page <= 1}
                                                onClick={() => handlePageChange(page - 1)}
                                                className="p-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown size={14} className="rotate-90" />
                                            </button>
                                            <button
                                                disabled={page >= totalPages}
                                                onClick={() => handlePageChange(page + 1)}
                                                className="p-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown size={14} className="-rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={kycConfirmUser !== null} onOpenChange={(open) => { if (!open) setKycConfirmUser(null); }}>
                <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-lg font-bold text-slate-800">
                            Verify User KYC
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-medium">
                            Are you sure you want to approve and verify the KYC status for <strong>{users.find(u => u.id === kycConfirmUser)?.name || "this user"}</strong>? This will grant them full onboarding permissions on the platform.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex items-center gap-2 sm:justify-end">
                        <button 
                            onClick={() => setKycConfirmUser(null)}
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl font-bold text-[11px] text-slate-500 hover:text-slate-700 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executeKycApprove}
                            className="px-4 py-2 bg-[#b68512] hover:bg-[#a0740f] text-white rounded-xl font-bold text-[11px] shadow-sm transition-all"
                        >
                            Confirm Verification
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
