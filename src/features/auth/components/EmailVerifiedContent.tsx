"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export function EmailVerifiedContent() {
    return (
        <div className="w-full max-w-md mx-auto text-center">
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">Email Verified</h1>

            <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                Your email has been verified. Click on the link below to set up your profile and portfolio.
            </p>

            <Link
                href="/dashboard/profile"
                className="text-[#C69C2E] text-sm font-medium hover:underline"
            >
                Set up your profile
            </Link>
        </div>
    );
}
