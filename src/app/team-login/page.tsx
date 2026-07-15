"use client";

import React, { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, AlertCircle, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TeamLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                username: email,
                password,
                isTeam: "true",
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/admin"); // Or team dashboard, routing to /admin for now
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-amber-100 selection:text-amber-900 font-sans">
            {/* Background design */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/5 blur-[120px]" />
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-slate-300/30 to-slate-200/5 blur-[100px]" />
            </div>

            <div className="relative w-full max-w-[420px]">
                {/* Logo or Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#b68512] to-[#dfaf3e] rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">
                        Team Portal
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-[280px]">
                        Secure access to your management dashboard and tools.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    {/* Top gradient highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-[#b68512] to-amber-600" />
                    
                    <form onSubmit={handleLogin} method="POST" className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-slide-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#b68512] transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your team email"
                                    className="w-full h-12 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl pl-10 pr-4 text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#b68512] focus:ring-4 focus:ring-amber-50 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-bold text-slate-700">Password</label>
                                <Link 
                                    href="/team-login/forgot-password" 
                                    className="text-[11px] font-bold text-[#b68512] hover:text-[#9d720f] transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#b68512] transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl pl-10 pr-4 text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#b68512] focus:ring-4 focus:ring-amber-50 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-[#b68512] to-[#d69f1a] hover:from-[#a37610] hover:to-[#c28e16] text-white rounded-2xl font-bold text-sm shadow-[0_4px_14px_0_rgb(182,133,18,0.39)] hover:shadow-[0_6px_20px_rgba(182,133,18,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs font-semibold text-slate-400 mt-8">
                    Powered by DGE Platform
                </p>
            </div>
        </div>
    );
}
