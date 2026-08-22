"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertTriangle, KeyRound } from "lucide-react";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";
import { changePassword } from "../actions";

interface ResetPasswordFormProps {
    onSuccess: () => void;
    onFailure: () => void;
}

export function ResetPasswordForm({ onSuccess, onFailure }: ResetPasswordFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tokenFromUrl = searchParams.get("token") || "";

    const [token, setToken] = useState(tokenFromUrl);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const passwordValue = watch("password") || "";
    const confirmPasswordValue = watch("confirmPassword") || "";
    const hasTypedConfirm = confirmPasswordValue.length > 0;
    const isPasswordMatch = hasTypedConfirm && passwordValue === confirmPasswordValue && passwordValue.length > 0;

    const onSubmit = async (data: ResetPasswordInput) => {
        setError(null);
        const activeToken = token.trim();

        if (!activeToken) {
            setError("No reset token found. Please click the link sent to your email or request a new reset link.");
            return;
        }

        try {
            const result = await changePassword({
                password: data.password,
                token: activeToken,
            });

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to reset password. The reset link may be invalid or expired.");
                onFailure();
            }
        } catch (err) {
            console.error("An unexpected error occurred while resetting password:", err);
            setError("An unexpected network error occurred. Please try again.");
            onFailure();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground text-sm">
                    Create a new password so you can access your account safely.
                </p>
            </div>

            {/* Token Warning Banner if token missing */}
            {!tokenFromUrl && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>Missing Reset Token</span>
                    </div>
                    <p>
                        No reset token was found in your URL. Please click the exact link in your reset email, or paste your token below:
                    </p>
                    <div className="pt-2">
                        <div className="relative">
                            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste reset token here..."
                                className="h-9 pl-9 text-xs rounded-lg bg-background"
                            />
                        </div>
                    </div>
                    <div className="pt-1 flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/forgot-password")}
                            className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 p-0 h-auto font-medium"
                        >
                            Request new reset link &rarr;
                        </Button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">
                        New Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...register("password")}
                            className={`h-12 rounded-xl pr-10 ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                    <PasswordStrengthChecker password={passwordValue} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        {hasTypedConfirm && (
                            <span className={`text-xs flex items-center gap-1 font-semibold ${isPasswordMatch ? "text-emerald-500" : "text-red-500"}`}>
                                {isPasswordMatch ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...register("confirmPassword")}
                            className={`h-12 rounded-xl pr-10 transition-all ${
                                hasTypedConfirm
                                    ? isPasswordMatch
                                        ? "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-500/5"
                                        : "border-red-500 focus-visible:ring-red-500 bg-red-500/5"
                                    : errors.confirmPassword
                                    ? "border-red-500"
                                    : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && !hasTypedConfirm && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Password...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
