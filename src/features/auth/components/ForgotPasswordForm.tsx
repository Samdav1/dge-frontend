"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";
import { sendPasswordResetLink } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ForgotPasswordFormProps {
    onSuccess: (email: string) => void;
    defaultEmail?: string;
}

export function ForgotPasswordForm({ onSuccess, defaultEmail }: ForgotPasswordFormProps) {
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: defaultEmail || "",
        },
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setError(null);
        try {
            const result = await sendPasswordResetLink(data.email);

            if (result.success) {
                onSuccess(data.email);
            } else {
                setError(result.error || "Failed to send reset link");
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
                <p className="text-muted-foreground text-sm">
                    Enter email use in creating your account
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
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

                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Send Instruction"
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
