"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { verifyEmailToken, resendEmailVerification } from "@/features/auth/actions";
import Link from "next/link";

export function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
        token ? "verifying" : "idle"
    );
    const [errorMessage, setErrorMessage] = useState("");
    const [resendStatus, setResendStatus] = useState<{ loading: boolean; message?: string; error?: string }>({
        loading: false,
    });

    useEffect(() => {
        if (!token) return;

        let isMounted = true;
        async function doVerify() {
            setStatus("verifying");
            const res = await verifyEmailToken(token as string);
            if (!isMounted) return;

            if (res.success) {
                setStatus("success");
                setTimeout(() => {
                    router.push("/email-verified");
                }, 1500);
            } else {
                setStatus("error");
                setErrorMessage(res.error || "Verification failed. The token may have expired.");
            }
        }

        doVerify();
        return () => {
            isMounted = false;
        };
    }, [token, router]);

    const handleResend = async () => {
        setResendStatus({ loading: true });
        const res = await resendEmailVerification();
        if (res.success) {
            setResendStatus({ loading: false, message: res.message || "Verification email sent successfully!" });
        } else {
            setResendStatus({ loading: false, error: res.error || "Failed to send email. Please log in first." });
        }
    };

    if (status === "verifying") {
        return (
            <div className="w-full max-w-md mx-auto text-center py-8">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-3">Verifying your email</h1>
                <p className="text-muted-foreground text-sm">
                    Please wait while we confirm your email token...
                </p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="w-full max-w-md mx-auto text-center py-8">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-green-700">Email Verified Successfully!</h1>
                <p className="text-muted-foreground text-sm mb-6">
                    Redirecting you to complete your setup...
                </p>
                <Link
                    href="/email-verified"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Continue
                </Link>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="w-full max-w-md mx-auto text-center py-8">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-red-600">Verification Failed</h1>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                    {errorMessage}
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <button
                        onClick={handleResend}
                        disabled={resendStatus.loading}
                        className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
                    </button>
                    {resendStatus.message && (
                        <p className="text-xs text-green-600 font-medium">{resendStatus.message}</p>
                    )}
                    {resendStatus.error && (
                        <p className="text-xs text-red-600 font-medium">{resendStatus.error}</p>
                    )}
                    <Link href="/dashboard" className="text-xs text-muted-foreground hover:underline mt-2">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto text-center">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-[#FFFBF0] rounded-full flex items-center justify-center">
                    <Send className="w-10 h-10 text-primary ml-1 mt-1" />
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">Check your email</h1>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                We&apos;ve sent a verification link to your email address. Please click the link in your email to verify your account.
            </p>

            <button
                className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resendStatus.loading}
            >
                {resendStatus.loading ? "Sending link..." : "Resend email"}
            </button>

            {resendStatus.message && (
                <p className="text-xs text-green-600 font-medium mt-3">{resendStatus.message}</p>
            )}
            {resendStatus.error && (
                <p className="text-xs text-red-600 font-medium mt-3">{resendStatus.error}</p>
            )}
        </div>
    );
}
