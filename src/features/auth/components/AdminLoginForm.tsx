"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (data: LoginInput) => {
        setLoginError(null);
        try {
            const result = await signIn("credentials", {
                username: data.email,
                password: data.password,
                isAdmin: "true",
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid credentials");
            }

            // Redirect to admin dashboard on success (or root admin page)
            window.location.href = "/admin";
        } catch (error: any) {
            console.error("Admin login error:", error);
            setLoginError(error.message || "Login failed. Please check your admin credentials.");
        }
    };

    return (
        <div className="w-full max-w-[500px] bg-white rounded-xl border border-slate-100 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
            {/* Upper Blue Icon Section */}
            <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#3b82f6]">
                    <div className="relative">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        {/* Lock overlay icon at bottom right */}
                        <div className="absolute -right-1 -bottom-1 flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm text-blue-500 border border-slate-50">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-8">
                <h1 className="text-[26px] font-semibold text-slate-900 mb-1 tracking-tight">Login Account</h1>
                <p className="text-slate-400 text-[13px]">
                    Login to console
                </p>
            </div>

            {loginError && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-xs text-center border border-red-100">
                    {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-5">
                {/* Email Address */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block" htmlFor="email">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        {...register("email")}
                        className={`h-11 rounded-lg border-slate-200 focus:border-blue-500 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:ring-1 focus:ring-blue-100 transition-all ${
                            errors.email ? "border-red-500 focus:ring-red-100" : ""
                        }`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 block" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...register("password")}
                            className={`h-11 rounded-lg border-slate-200 focus:border-blue-500 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:ring-1 focus:ring-blue-100 transition-all pr-10 ${
                                errors.password ? "border-red-500 focus:ring-red-100" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} className="text-[#c68f15]" /> : <Eye size={18} className="text-[#c68f15]" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                    )}
                </div>

                {/* Login Button */}
                <Button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm border-0"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </Button>
            </form>
        </div>
    );
}
