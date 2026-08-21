"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";

interface ResetPasswordFormProps {
    onSuccess: () => void;
    onFailure: () => void;
}

export function ResetPasswordForm({ onSuccess, onFailure }: ResetPasswordFormProps) {
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
        console.log("Reset password data:", data);
        // TODO: Implement actual reset password logic
        // Simulating a random success/failure for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, let's say if password contains "fail", it fails.
        if (data.password.includes("fail")) {
            setError("Failed to reset password. Please try again.");
            onFailure();
        } else {
            onSuccess();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground text-sm">
                    Create a new password so you can get back into your account.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
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
                            placeholder="Confirm password"
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
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
