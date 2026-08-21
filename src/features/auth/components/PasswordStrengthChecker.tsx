"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthCheckerProps {
    password?: string;
}

export function calculatePasswordStrength(password: string = "") {
    const checks = {
        minChar: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    const count = Object.values(checks).filter(Boolean).length;

    let label = "Very Weak";
    let colorClass = "bg-gray-200 dark:bg-gray-800 text-gray-400";
    let barColor = "bg-red-500";
    let percent = 0;

    if (password.length === 0) {
        label = "";
        percent = 0;
    } else if (count <= 1) {
        label = "Weak";
        colorClass = "text-red-500 font-semibold";
        barColor = "bg-red-500";
        percent = 25;
    } else if (count === 2 || count === 3) {
        label = "Medium";
        colorClass = "text-amber-500 font-semibold";
        barColor = "bg-amber-500";
        percent = 60;
    } else if (count >= 4) {
        label = "Strong";
        colorClass = "text-emerald-500 font-bold";
        barColor = "bg-emerald-500";
        percent = 100;
    }

    return { checks, count, label, colorClass, barColor, percent };
}

export function PasswordStrengthChecker({ password = "" }: PasswordStrengthCheckerProps) {
    if (!password) return null;

    const { checks, label, colorClass, barColor, percent } = calculatePasswordStrength(password);

    return (
        <div className="space-y-2 mt-2 pt-1 animate-in fade-in duration-200">
            {/* Strength Bar & Badge Header */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Password Strength:</span>
                <span className={colorClass}>{label}</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex gap-1">
                <div
                    className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Rule Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${checks.minChar ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    {checks.minChar ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${checks.hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    {checks.hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span>Uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${checks.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    {checks.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${checks.hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    {checks.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span>Special character (!@#$)</span>
                </div>
            </div>
        </div>
    );
}
