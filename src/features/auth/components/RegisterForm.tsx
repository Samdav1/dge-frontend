"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { registerUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/marketplace";
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            terms: false,
        },
    });

    const passwordValue = watch("password") || "";
    const confirmPasswordValue = watch("confirmPassword") || "";
    const hasTypedConfirm = confirmPasswordValue.length > 0;
    const isPasswordMatch = hasTypedConfirm && passwordValue === confirmPasswordValue && passwordValue.length > 0;

    const onSubmit = async (data: RegisterInput) => {
        try {
            const result = await registerUser(data);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Redirect to login on success, preserving callbackUrl
            window.location.href = `/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`;
        } catch (error) {
            console.error("Registration error:", error);
            // TODO: Handle error state (e.g., show toast)
            toast.error(error instanceof Error ? error.message : "Registration failed");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <Link href="/">
                        <img src="/DGE logo.png" alt="DGE Logo" className="h-12 w-auto" />
                    </Link>
                </div>
                <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground text-sm">
                    Create your <span className="text-primary font-medium">DGE</span> account in just a few steps
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="username">
                        Username
                    </label>
                    <Input
                        id="username"
                        placeholder="Enter username"
                        {...register("username")}
                        className={`h-12 rounded-xl ${errors.username ? "border-red-500" : ""}`}
                    />
                    {errors.username && (
                        <p className="text-xs text-red-500">{errors.username.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        placeholder="Enter email address"
                        {...register("email")}
                        className={`h-12 rounded-xl ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

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
                    {/* Live Password Strength Meter & Checklist */}
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
                            placeholder="Re-enter password"
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

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="referralCode">
                        Referral Code (Optional)
                    </label>
                    <Input
                        id="referralCode"
                        placeholder="Enter referral code"
                        {...register("referralCode")}
                        className="h-12 rounded-xl"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        onCheckedChange={(checked) => setValue("terms", checked as boolean)}
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                        I&apos;ve read and agree with your <span className="text-primary">Terms of Services</span>
                    </label>
                </div>
                {errors.terms && (
                    <p className="text-xs text-red-500">{errors.terms.message}</p>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or create account with
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-input hover:bg-accent font-medium"
                    onClick={() => {
                        document.cookie = "auth_intent=signup; path=/; max-age=3600";
                        setIsGoogleLoading(true);
                        signIn("google", { callbackUrl });
                    }}
                    disabled={isGoogleLoading}
                >
                    {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
