"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ArrowDownUp, MessageSquare, Sparkles, Coins } from "lucide-react";

interface RideNegotiationModalProps {
    onClose: () => void;
    onSubmit: (fare: number) => void;
    estimatedFare?: number;
}

import { getUserWallet } from "@/features/wallet/actions";

export function RideNegotiationModal({ onClose, onSubmit, estimatedFare = 85000 }: RideNegotiationModalProps) {
    const [offer, setOffer] = React.useState<string>("");
    const [walletBalance, setWalletBalance] = React.useState<number | null>(null);

    React.useEffect(() => {
        async function fetchWallet() {
            const res = await getUserWallet();
            if (res.success && res.data && res.data.length > 0) {
                const depositWallet = res.data.find((w: any) => w.wallet_type === "deposit");
                if (depositWallet) {
                    setWalletBalance(depositWallet.balance_cents / 100);
                } else {
                    setWalletBalance(0);
                }
            } else {
                setWalletBalance(0);
            }
        }
        fetchWallet();
    }, []);

    const offerValue = parseFloat(offer) || 0;
    const isOfferValid = walletBalance !== null && offerValue <= walletBalance && offerValue > 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-[#C69C2E] to-[#E5B84D]" />

                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-5 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center">
                            <ArrowDownUp className="w-5 h-5 text-[#C69C2E]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Price Negotiation</h2>
                            <p className="text-xs text-gray-400">Propose your preferred fare</p>
                        </div>
                    </div>

                    <div className="space-y-5 mt-6">
                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Initial Price</label>
                            <div className="h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center px-4 text-gray-900 font-bold text-sm">
                                ₦{estimatedFare.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Your Offer</label>
                            <Input
                                type="number"
                                placeholder="Enter your price"
                                value={offer}
                                onChange={(e) => setOffer(e.target.value)}
                                className={`h-12 bg-white rounded-xl text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30 ${
                                    walletBalance !== null && offerValue > walletBalance 
                                    ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" 
                                    : "border-gray-200"
                                }`}
                            />
                            {walletBalance !== null && offerValue > walletBalance && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">Your offer exceeds your wallet balance of ₦{walletBalance.toLocaleString()}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3" />
                                Message (Optional)
                            </label>
                            <Textarea
                                placeholder="Add a note for the driver..."
                                className="min-h-[100px] bg-white border-gray-200 rounded-xl resize-none text-sm focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/30"
                            />
                        </div>

                        {/* Fair-use Points Notice */}
                        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-left flex items-start gap-2">
                            <Coins className="w-3.5 h-3.5 text-[#C69C2E] shrink-0 mt-0.5" />
                            <div className="text-[11px] text-amber-800 leading-tight">
                                <span className="font-bold">1 DGE Point</span> is deducted from both passenger and driver upon agreeing on the ride (or after 3 unagreed offers).
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl font-semibold text-sm border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => isOfferValid && onSubmit(offerValue)}
                            disabled={!isOfferValid}
                            className="flex-1 h-11 rounded-xl font-semibold text-sm bg-[#C69C2E] hover:bg-[#b08b29] text-white transition-all hover:shadow-lg hover:shadow-[#C69C2E]/20 disabled:opacity-50"
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            Send Offer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
