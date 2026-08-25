"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react";
import { resendEmailVerification, getCurrentUserInfo } from "@/features/auth/actions";

export function EmailVerificationBanner() {
    const [userState, setUserState] = useState<{ email_verified?: boolean; google_auth?: boolean; email?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getCurrentUserInfo();
                if (res.success && res.data) {
                    setUserState(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch user verification status:", err);
            }
        };
        fetchUser();
    }, []);

    if (!userState) return null;
    // Hide banner if email is already verified or user logged in via google auth or user dismissed
    if (userState.email_verified || userState.google_auth || dismissed) {
        return null;
    }

    const handleResend = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await resendEmailVerification();
            if (res.success) {
                setMessage("Verification link sent! Please check your inbox.");
            } else {
                setError(res.error || "Failed to send email verification.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-3 sm:px-6 relative flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium z-30 transition-all">
            <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <AlertTriangle size={15} />
                </div>
                <div>
                    <span className="font-bold text-amber-900 dark:text-amber-100">Verify your email address: </span>
                    <span className="text-amber-800 dark:text-amber-300">
                        Please verify <strong className="underline decoration-amber-400">{userState.email}</strong> to unlock full platform features (creating & purchasing services, bidding, driving).
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {message ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 size={14} /> {message}
                    </span>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={13} className="animate-spin" /> Sending...
                            </>
                        ) : (
                            <>
                                <Mail size={13} /> Resend Verification Link
                            </>
                        )}
                    </button>
                )}

                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 rounded-md transition-colors cursor-pointer"
                    title="Dismiss"
                >
                    <X size={15} />
                </button>
            </div>
            {error && (
                <p className="w-full text-red-600 dark:text-red-400 text-xs font-semibold mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
