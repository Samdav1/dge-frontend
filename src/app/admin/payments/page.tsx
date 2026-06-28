"use client";

import React, { useState, useEffect } from "react";
import { 
    Wallet, 
    ArrowUpFromLine, 
    ArrowDownToLine, 
    Settings, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Search,
    Filter,
    MoreVertical,
    Clock,
    AlertCircle,
    Info,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminPaymentsPage() {
    const [settings, setSettings] = useState({
        auto_approve_withdrawals: false,
        screen_deposits: false,
    });
    const [feeConfig, setFeeConfig] = useState({
        escrow_release_fee_enabled: true,
        escrow_release_fee_type: "percentage",
        escrow_release_fee_value: 5.0,

        deposit_fee_enabled: false,
        deposit_fee_type: "percentage",
        deposit_fee_value: 0.0,

        withdrawal_fee_enabled: true,
        withdrawal_fee_type: "percentage",
        withdrawal_fee_value: 1.0,
    });
    const [withdrawals, setWithdrawals] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [updatingFees, setUpdatingFees] = useState(false);
    
    // Approval/Rejection State
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processingAction, setProcessingAction] = useState(false);

    // Revenue Tracking State
    const [revenueLogs, setRevenueLogs] = useState<any[]>([]);
    const [revenueStats, setRevenueStats] = useState({
        total_all_time: 0,
        total_this_month: 0,
        total_today: 0,
        total_all_time_formatted: "₦0.00",
        total_this_month_formatted: "₦0.00",
        total_today_formatted: "₦0.00",
    });
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [revenuePage, setRevenuePage] = useState(1);
    const [revenueTotalCount, setRevenueTotalCount] = useState(0);
    const [revenueFilter, setRevenueFilter] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchRevenueData(revenuePage, revenueFilter);
    }, [revenuePage, revenueFilter]);

    const fetchRevenueData = async (page = 1, filter = "") => {
        setRevenueLoading(true);
        try {
            const res = await fetch(`/api/admin/revenue?page=${page}&event_type=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setRevenueLogs(data.revenue_logs || []);
                setRevenueTotalCount(data.total_count || 0);
                if (data.stats) {
                    setRevenueStats(data.stats);
                }
            }
        } catch (error) {
            console.error("Error fetching revenue data:", error);
        } finally {
            setRevenueLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, withdrawalsRes, depositsRes, feeConfigRes] = await Promise.all([
                fetch("/api/admin/payment-settings"),
                fetch("/api/admin/withdrawals?status=pending"),
                fetch("/api/admin/deposits?status=screened_pending"),
                fetch("/api/admin/fee-config")
            ]);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (feeConfigRes.ok) setFeeConfig(await feeConfigRes.json());
            if (withdrawalsRes.ok) {
                const data = await withdrawalsRes.json();
                setWithdrawals(data.withdrawals || []);
            }
            if (depositsRes.ok) {
                const data = await depositsRes.json();
                setDeposits(data.deposits || []);
            }
        } catch (error) {
            console.error("Error fetching payment data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSetting = async (key: string, value: boolean) => {
        setUpdatingSettings(true);
        try {
            const res = await fetch("/api/admin/payment-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value })
            });
            if (res.ok) {
                setSettings(prev => ({ ...prev, [key]: value }));
            }
        } catch (error) {
            console.error("Error updating settings:", error);
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleUpdateFeeConfig = async (key: string, value: any) => {
        setUpdatingFees(true);
        try {
            const updated = { ...feeConfig, [key]: value };
            const res = await fetch("/api/admin/fee-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value })
            });
            if (res.ok) {
                setFeeConfig(prev => ({ ...prev, [key]: value }));
            }
        } catch (error) {
            console.error("Error updating fee config:", error);
        } finally {
            setUpdatingFees(false);
        }
    };

    const handleWithdrawalAction = async (action: 'approve' | 'reject') => {
        if (!selectedWithdrawal) return;
        setProcessingAction(true);
        try {
            const res = await fetch(`/api/admin/withdrawals?id=${selectedWithdrawal.id}&action=${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: action === 'reject' ? JSON.stringify({ reason: rejectionReason }) : undefined
            });

            if (res.ok) {
                setIsApproveModalOpen(false);
                setIsRejectModalOpen(false);
                setRejectionReason("");
                fetchData(); // Refresh list
            }
        } catch (error) {
            console.error(`Error ${action}ing withdrawal:`, error);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleApproveDeposit = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/deposits?id=${id}&action=approve`, {
                method: "POST"
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Error approving deposit:", error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount / 100);
    };

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
                            Payment Management
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

                <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full flex-1 overflow-y-auto">

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Auto-approve Withdrawals</h3>
                            <p className="text-sm text-slate-500">Bypass manual review for all withdrawal requests</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleSetting('auto_approve_withdrawals', !settings.auto_approve_withdrawals)}
                        disabled={updatingSettings}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.auto_approve_withdrawals ? 'bg-amber-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.auto_approve_withdrawals ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Filter className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Screen Deposits</h3>
                            <p className="text-sm text-slate-500">Require admin approval before crediting wallets</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggleSetting('screen_deposits', !settings.screen_deposits)}
                        disabled={updatingSettings}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.screen_deposits ? 'bg-amber-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.screen_deposits ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Platform Fees section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Platform Fee Configurations</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Manage DGE SPACE commissions and transaction charges</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Escrow Release Fee */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#C69C2E]">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <button 
                                    onClick={() => handleUpdateFeeConfig('escrow_release_fee_enabled', !feeConfig.escrow_release_fee_enabled)}
                                    disabled={updatingFees}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${feeConfig.escrow_release_fee_enabled ? 'bg-[#C69C2E]' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feeConfig.escrow_release_fee_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 mt-4">Escrow Release Fee</h3>
                            <p className="text-xs text-slate-500 mt-1">Deducted from payouts when escrow is released to providers</p>
                        </div>

                        {feeConfig.escrow_release_fee_enabled && (
                            <div className="space-y-3 pt-2">
                                <div className="flex rounded-lg bg-slate-100 p-0.5">
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('escrow_release_fee_type', 'percentage');
                                            // Reset to standard percentage value if switching
                                            handleUpdateFeeConfig('escrow_release_fee_value', 5.0);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.escrow_release_fee_type === 'percentage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('escrow_release_fee_type', 'flat');
                                            // Reset to default flat value in cents (e.g. ₦500.00 = 50000 cents)
                                            handleUpdateFeeConfig('escrow_release_fee_value', 50000);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.escrow_release_fee_type === 'flat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Flat (₦)
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={feeConfig.escrow_release_fee_type === 'percentage' ? '5' : '500'}
                                        key={`${feeConfig.escrow_release_fee_type}-${feeConfig.escrow_release_fee_value}`}
                                        defaultValue={feeConfig.escrow_release_fee_type === 'flat' ? feeConfig.escrow_release_fee_value / 100 : feeConfig.escrow_release_fee_value}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const finalVal = feeConfig.escrow_release_fee_type === 'flat' ? Math.round(val * 100) : val;
                                            handleUpdateFeeConfig('escrow_release_fee_value', finalVal);
                                        }}
                                        className="h-9 text-sm rounded-xl focus:border-[#C69C2E]"
                                    />
                                    <div className="flex items-center text-sm font-semibold text-slate-500 bg-slate-50 px-3 border rounded-xl">
                                        {feeConfig.escrow_release_fee_type === 'percentage' ? '%' : '₦'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Deposit Fee */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                    <ArrowDownToLine className="w-5 h-5" />
                                </div>
                                <button 
                                    onClick={() => handleUpdateFeeConfig('deposit_fee_enabled', !feeConfig.deposit_fee_enabled)}
                                    disabled={updatingFees}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${feeConfig.deposit_fee_enabled ? 'bg-[#C69C2E]' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feeConfig.deposit_fee_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 mt-4">Deposit Fee</h3>
                            <p className="text-xs text-slate-500 mt-1">Fee charged to users on every successful wallet funding</p>
                        </div>

                        {feeConfig.deposit_fee_enabled && (
                            <div className="space-y-3 pt-2">
                                <div className="flex rounded-lg bg-slate-100 p-0.5">
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('deposit_fee_type', 'percentage');
                                            handleUpdateFeeConfig('deposit_fee_value', 1.0);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.deposit_fee_type === 'percentage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('deposit_fee_type', 'flat');
                                            handleUpdateFeeConfig('deposit_fee_value', 10000);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.deposit_fee_type === 'flat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Flat (₦)
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={feeConfig.deposit_fee_type === 'percentage' ? '1' : '100'}
                                        key={`${feeConfig.deposit_fee_type}-${feeConfig.deposit_fee_value}`}
                                        defaultValue={feeConfig.deposit_fee_type === 'flat' ? feeConfig.deposit_fee_value / 100 : feeConfig.deposit_fee_value}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const finalVal = feeConfig.deposit_fee_type === 'flat' ? Math.round(val * 100) : val;
                                            handleUpdateFeeConfig('deposit_fee_value', finalVal);
                                        }}
                                        className="h-9 text-sm rounded-xl focus:border-[#C69C2E]"
                                    />
                                    <div className="flex items-center text-sm font-semibold text-slate-500 bg-slate-50 px-3 border rounded-xl">
                                        {feeConfig.deposit_fee_type === 'percentage' ? '%' : '₦'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Withdrawal Fee */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-650">
                                    <ArrowUpFromLine className="w-5 h-5" />
                                </div>
                                <button 
                                    onClick={() => handleUpdateFeeConfig('withdrawal_fee_enabled', !feeConfig.withdrawal_fee_enabled)}
                                    disabled={updatingFees}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${feeConfig.withdrawal_fee_enabled ? 'bg-[#C69C2E]' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${feeConfig.withdrawal_fee_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 mt-4">Withdrawal Fee</h3>
                            <p className="text-xs text-slate-500 mt-1">Fee charged when users withdraw earnings to their bank accounts</p>
                        </div>

                        {feeConfig.withdrawal_fee_enabled && (
                            <div className="space-y-3 pt-2">
                                <div className="flex rounded-lg bg-slate-100 p-0.5">
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('withdrawal_fee_type', 'percentage');
                                            handleUpdateFeeConfig('withdrawal_fee_value', 1.0);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.withdrawal_fee_type === 'percentage' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleUpdateFeeConfig('withdrawal_fee_type', 'flat');
                                            handleUpdateFeeConfig('withdrawal_fee_value', 10000);
                                        }}
                                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-all ${feeConfig.withdrawal_fee_type === 'flat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Flat (₦)
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={feeConfig.withdrawal_fee_type === 'percentage' ? '1' : '100'}
                                        key={`${feeConfig.withdrawal_fee_type}-${feeConfig.withdrawal_fee_value}`}
                                        defaultValue={feeConfig.withdrawal_fee_type === 'flat' ? feeConfig.withdrawal_fee_value / 100 : feeConfig.withdrawal_fee_value}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const finalVal = feeConfig.withdrawal_fee_type === 'flat' ? Math.round(val * 100) : val;
                                            handleUpdateFeeConfig('withdrawal_fee_value', finalVal);
                                        }}
                                        className="h-9 text-sm rounded-xl focus:border-[#C69C2E]"
                                    />
                                    <div className="flex items-center text-sm font-semibold text-slate-500 bg-slate-50 px-3 border rounded-xl">
                                        {feeConfig.withdrawal_fee_type === 'percentage' ? '%' : '₦'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <Tabs defaultValue="withdrawals" className="w-full">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                        <TabsList className="bg-slate-100/50 p-1">
                            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm px-6">
                                Withdrawal Queue
                                {withdrawals.length > 0 && <Badge className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">{withdrawals.length}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="deposits" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm px-6">
                                Deposit Queue
                                {deposits.length > 0 && <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">{deposits.length}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-[#C69C2E] data-[state=active]:shadow-sm px-6">
                                Platform Revenue
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="withdrawals" className="m-0">
                        <div className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="pl-6 font-bold text-slate-700">User</TableHead>
                                        <TableHead className="font-bold text-slate-700">Amount</TableHead>
                                        <TableHead className="font-bold text-slate-700">Bank Details</TableHead>
                                        <TableHead className="font-bold text-slate-700">Date</TableHead>
                                        <TableHead className="font-bold text-slate-700">Status</TableHead>
                                        <TableHead className="pr-6 text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Loading withdrawals...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : withdrawals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <Clock className="w-10 h-10 opacity-20" />
                                                    <p>No pending withdrawals at the moment</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        withdrawals.map((w: any) => (
                                            <TableRow key={w.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{w.user_name}</span>
                                                        <span className="text-xs text-slate-500">{w.user_email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-amber-600">{w.amount}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{w.bank_name}</span>
                                                        <span className="text-xs text-slate-500">{w.bank_account_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {new Date(w.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none capitalize">
                                                        {w.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-green-200 text-green-700 hover:bg-green-50"
                                                            onClick={() => {
                                                                setSelectedWithdrawal(w);
                                                                setIsApproveModalOpen(true);
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedWithdrawal(w);
                                                                setIsRejectModalOpen(true);
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="deposits" className="m-0">
                        <div className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="pl-6 font-bold text-slate-700">User</TableHead>
                                        <TableHead className="font-bold text-slate-700">Amount</TableHead>
                                        <TableHead className="font-bold text-slate-700">Reference</TableHead>
                                        <TableHead className="font-bold text-slate-700">Date</TableHead>
                                        <TableHead className="pr-6 text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Loading deposits...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : deposits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <ArrowDownToLine className="w-10 h-10 opacity-20" />
                                                    <p>No pending deposits awaiting screening</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        deposits.map((d: any) => (
                                            <TableRow key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{d.user_name}</span>
                                                        <span className="text-xs text-slate-500">{d.user_email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-green-600">{d.amount}</TableCell>
                                                <TableCell className="text-xs font-mono text-slate-500">{d.monnify_reference}</TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {new Date(d.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 bg-[#C69C2E] hover:bg-[#b08b29] text-white"
                                                        onClick={() => handleApproveDeposit(d.id)}
                                                    >
                                                        Approve Deposit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="revenue" className="m-0">
                        {/* Stats Dashboard in Tab */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue (All Time)</span>
                                    <h4 className="text-2xl font-bold text-slate-800 mt-2">{revenueStats.total_all_time_formatted}</h4>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
                                    <h4 className="text-2xl font-bold text-[#C69C2E] mt-2">{revenueStats.total_this_month_formatted}</h4>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
                                    <h4 className="text-2xl font-bold text-green-600 mt-2">{revenueStats.total_today_formatted}</h4>
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">Filter Event:</span>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                    <button 
                                        type="button"
                                        onClick={() => { setRevenueFilter(""); setRevenuePage(1); }}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${revenueFilter === "" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        All
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRevenueFilter("escrow_release"); setRevenuePage(1); }}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${revenueFilter === "escrow_release" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Escrow
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRevenueFilter("deposit"); setRevenuePage(1); }}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${revenueFilter === "deposit" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Deposits
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRevenueFilter("withdrawal"); setRevenuePage(1); }}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${revenueFilter === "withdrawal" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Withdrawals
                                    </button>
                                </div>
                            </div>

                            <span className="text-xs text-slate-400 font-medium">Total transaction logs: {revenueTotalCount}</span>
                        </div>

                        <div className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="pl-6 font-bold text-slate-700">User / Reference</TableHead>
                                        <TableHead className="font-bold text-slate-700">Event</TableHead>
                                        <TableHead className="font-bold text-slate-700">Gross Amount</TableHead>
                                        <TableHead className="font-bold text-slate-700">Fee Rate</TableHead>
                                        <TableHead className="font-bold text-slate-700">Fee Earned</TableHead>
                                        <TableHead className="pr-6 font-bold text-slate-700">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Loading revenue logs...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : revenueLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <Wallet className="w-10 h-10 opacity-20" />
                                                    <p>No revenue records found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        revenueLogs.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{log.user_name || "N/A"}</span>
                                                        <span className="text-xs text-slate-500">{log.user_email || "N/A"}</span>
                                                        <span className="text-[10px] font-mono text-slate-400 mt-1">Ref: {log.reference}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {log.event_type === "escrow_release" && (
                                                        <Badge className="bg-amber-100 text-amber-805 hover:bg-amber-100 border-none rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                                            Escrow Release
                                                        </Badge>
                                                    )}
                                                    {log.event_type === "deposit" && (
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                                            Deposit
                                                        </Badge>
                                                    )}
                                                    {log.event_type === "withdrawal" && (
                                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none rounded-full px-2.5 py-0.5 text-xs font-semibold">
                                                            Withdrawal
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-medium">{log.gross_amount}</TableCell>
                                                <TableCell className="text-xs font-semibold text-slate-500">
                                                    {log.fee_type === "percentage" ? `${log.fee_value}%` : `₦${log.fee_value / 100}`}
                                                </TableCell>
                                                <TableCell className="font-bold text-green-600">{log.fee_amount}</TableCell>
                                                <TableCell className="pr-6 text-sm text-slate-500">
                                                    {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {revenueTotalCount > 50 && (
                                <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                                    <Button
                                        disabled={revenuePage === 1}
                                        onClick={() => setRevenuePage(prev => Math.max(1, prev - 1))}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-xs text-slate-500">
                                        Page {revenuePage} of {Math.ceil(revenueTotalCount / 50)}
                                    </span>
                                    <Button
                                        disabled={revenuePage >= Math.ceil(revenueTotalCount / 50)}
                                        onClick={() => setRevenuePage(prev => prev + 1)}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
                </div>
            </main>

            {/* Approval Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Approve Withdrawal
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            You are about to release <span className="font-bold text-slate-800">{selectedWithdrawal?.amount}</span> to <span className="font-bold text-slate-800">{selectedWithdrawal?.bank_account_name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Bank:</span>
                            <span className="font-medium text-slate-700">{selectedWithdrawal?.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Account:</span>
                            <span className="font-medium text-slate-700">{selectedWithdrawal?.bank_account_number}</span>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="rounded-xl flex-1 h-11" onClick={() => setIsApproveModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex-1 h-11"
                            disabled={processingAction}
                            onClick={() => handleWithdrawalAction('approve')}
                        >
                            {processingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Approval"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
                            <XCircle className="w-6 h-6" />
                            Reject Withdrawal
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Please provide a reason for rejecting this withdrawal request. This will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full h-32 p-3 rounded-2xl border border-slate-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm resize-none"
                        />
                    </div>
                    <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="rounded-xl flex-1 h-11" onClick={() => setIsRejectModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex-1 h-11"
                            disabled={processingAction || !rejectionReason.trim()}
                            onClick={() => handleWithdrawalAction('reject')}
                        >
                            {processingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
