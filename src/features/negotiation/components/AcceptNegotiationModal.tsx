"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface AcceptNegotiationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept: (paymentMethod?: string) => void;
    isBuyer?: boolean;
    isLoading?: boolean;
    error?: string | null;
}

export function AcceptNegotiationModal({ open, onOpenChange, onAccept, isBuyer, isLoading, error }: AcceptNegotiationModalProps) {
    const [paymentMethod, setPaymentMethod] = React.useState("platform");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Accept Negotiation
                    </h2>

                    <p className="text-gray-500 mb-6 text-sm">
                        Are you sure you want to accept this negotiation?
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold text-center w-full animate-shake">
                            {error}
                        </div>
                    )}

                    {isBuyer && (
                        <div className="w-full text-left mb-6 space-y-2">
                            <label htmlFor="modal-payment-method" className="text-xs font-semibold text-gray-700">Payment Method</label>
                            <select
                                id="modal-payment-method"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-900 h-12 rounded-xl px-3 outline-none focus:border-[#C69C2E] text-sm"
                            >
                                <option value="platform">Platform Wallet</option>
                                <option value="cash">Offline (Cash) Payment</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-4 w-full">
                        <Button
                            onClick={() => onAccept(isBuyer ? paymentMethod : undefined)}
                            disabled={isLoading}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12 rounded-xl flex items-center justify-center gap-1.5"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Accept"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1 border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white h-12 rounded-xl"
                        >
                            No, Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
