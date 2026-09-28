"use client";

import React, { useEffect, useState } from "react";
import { Coins, Loader2, Save, CheckCircle, AlertTriangle, TrendingUp, Gift } from "lucide-react";
import { toast } from "sonner";

export default function PointsSettingsView() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        rate_per_point: 100,
        signup_bonus_points: 10,
        min_purchase_points: 1,
        updated_at: null as string | null,
    });

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/points-settings");
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    rate_per_point: data.rate_per_point ?? 100,
                    signup_bonus_points: data.signup_bonus_points ?? 10,
                    min_purchase_points: data.min_purchase_points ?? 1,
                    updated_at: data.updated_at ?? null,
                });
            } else {
                setError("Failed to load DGE Points configuration from server.");
            }
        } catch (err: any) {
            console.error("Failed to load points settings:", err);
            setError(err.message || "Network error loading points configuration.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/points-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rate_per_point: Number(settings.rate_per_point),
                    signup_bonus_points: Number(settings.signup_bonus_points),
                    min_purchase_points: Number(settings.min_purchase_points),
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setSettings({
                    rate_per_point: updated.rate_per_point,
                    signup_bonus_points: updated.signup_bonus_points,
                    min_purchase_points: updated.min_purchase_points,
                    updated_at: updated.updated_at,
                });
                toast.success("DGE Points configuration successfully updated!");
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData.detail || "Failed to update points settings";
                setError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while saving.");
            toast.error("Failed to update points settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-medium">Loading DGE Points settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex-1 flex flex-col max-w-4xl">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                    DGE Points Configuration
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                    Manage the official platform exchange rate and sign-up bonus awarded to new users.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-[#2A2A2A] shadow-sm space-y-7">
                {/* Visual Header / Banner */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-[#202020] pb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-[#C69C2E] flex items-center justify-center font-bold text-xl shrink-0">
                        <Coins className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">DGE Points System Settings</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Default rate: ₦100 per point. Changes apply instantly across the entire platform.
                        </p>
                        {settings.updated_at && (
                            <p className="text-[10px] text-slate-400 mt-1">
                                Last updated: {new Date(settings.updated_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rate per Point */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Exchange Rate (₦ per Point)</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                            The amount in Naira (NGN) charged to users per 1 DGE Point.
                        </p>
                        <div className="relative mt-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                ₦
                            </span>
                            <input
                                type="number"
                                min="1"
                                step="any"
                                required
                                value={settings.rate_per_point}
                                onChange={(e) => setSettings({ ...settings, rate_per_point: parseFloat(e.target.value) || 0 })}
                                className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-[#2E2E2E] dark:bg-[#1A1A1A] dark:text-white font-bold text-sm focus:border-[#C69C2E] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Signup Bonus Points */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5 text-[#C69C2E]" />
                            <span>Sign-up Bonus (Points)</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                            Points automatically credited to each user upon registration.
                        </p>
                        <div className="relative mt-1">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={settings.signup_bonus_points}
                                onChange={(e) => setSettings({ ...settings, signup_bonus_points: parseInt(e.target.value) || 0 })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-[#2E2E2E] dark:bg-[#1A1A1A] dark:text-white font-bold text-sm focus:border-[#C69C2E] focus:outline-none"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                                Points
                            </span>
                        </div>
                    </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                        Live Calculator Preview
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white dark:bg-[#1C1C1C] p-3 rounded-xl border border-amber-100 dark:border-[#2E2E2E]">
                            <span className="text-slate-400 block text-[10px]">Signup Bonus Value</span>
                            <strong className="text-slate-800 dark:text-white font-bold text-sm">
                                ₦{(settings.signup_bonus_points * settings.rate_per_point).toLocaleString()}
                            </strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">({settings.signup_bonus_points} pts)</span>
                        </div>
                        <div className="bg-white dark:bg-[#1C1C1C] p-3 rounded-xl border border-amber-100 dark:border-[#2E2E2E]">
                            <span className="text-slate-400 block text-[10px]">User pays for 50 Points</span>
                            <strong className="text-slate-800 dark:text-white font-bold text-sm">
                                ₦{(50 * settings.rate_per_point).toLocaleString()}
                            </strong>
                        </div>
                        <div className="bg-white dark:bg-[#1C1C1C] p-3 rounded-xl border border-amber-100 dark:border-[#2E2E2E]">
                            <span className="text-slate-400 block text-[10px]">User pays for 100 Points</span>
                            <strong className="text-slate-800 dark:text-white font-bold text-sm">
                                ₦{(100 * settings.rate_per_point).toLocaleString()}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#202020]">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-[#C69C2E] hover:bg-[#b08b29] text-white text-xs font-bold transition-all shadow-md shadow-[#C69C2E]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Configuration</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
