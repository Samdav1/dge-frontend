"use client";

import React, { useState } from "react";
import { getUserKyc } from "@/features/profile/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useKycGate() {
    const [isOpen, setIsOpen] = useState(false);
    const [feature, setFeature] = useState("");
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const router = useRouter();

    const checkKyc = async (action: () => void, featureName: string) => {
        try {
            const res = await getUserKyc();
            if (res.success && res.data && res.data.status === "verified") {
                action();
                return true;
            } else {
                setFeature(featureName);
                setPendingAction(() => action);
                setIsOpen(true);
                return false;
            }
        } catch (error) {
            console.error("KYC check error:", error);
            toast.error("Failed to verify account status. Please try again.");
            return false;
        }
    };

    const handleVerifyNow = () => {
        setIsOpen(false);
        router.push("/dashboard/profile?tab=kyc");
    };

    const KycGateModal = (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl p-0 border border-gray-100 dark:border-[#2A2A2A] dark:bg-[#121212] overflow-hidden relative">
                {/* Decorative background gradients */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#C69C2E]/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#C69C2E]/5 blur-2xl pointer-events-none" />

                <div className="flex flex-col items-center text-center px-8 pt-8 pb-8 space-y-5 relative z-10">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center border border-amber-200/40 dark:border-amber-900/30 shadow-inner shrink-0">
                        <ShieldAlert className="w-8 h-8 text-[#C69C2E]" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Identity Verification Required
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                            To ensure safety and compliance, you must verify your identity before you can{" "}
                            <span className="font-bold text-[#C69C2E]">{feature || "access this feature"}</span>.
                        </DialogDescription>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 w-full pt-1">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerifyNow}
                            className="flex-1 bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-xl font-bold h-11 shadow-md shadow-[#C69C2E]/10 hover:shadow-lg hover:shadow-[#C69C2E]/20 transition-all"
                        >
                            Verify Identity
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    return {
        checkKyc,
        KycGateModal,
    };
}
