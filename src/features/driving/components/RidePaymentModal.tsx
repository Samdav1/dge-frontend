import React from "react";
import { Button } from "@/components/ui/button";
import { X, Wallet, AlertTriangle, ShieldCheck, Star } from "lucide-react";
import { submitTripReview } from "../actions";

interface RidePaymentModalProps {
    tripId: string;
    onClose: () => void;
    onPayment: () => void;
    amountToPay: number; // in NGN
}

import { getUserWallet } from "@/features/wallet/actions";

export function RidePaymentModal({ tripId, onClose, onPayment, amountToPay }: RidePaymentModalProps) {
    const [walletBalance, setWalletBalance] = React.useState<number | null>(null);
    const [rating, setRating] = React.useState<number>(0);
    const [comment, setComment] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchWallet() {
            const res = await getUserWallet();
            if (res.success && res.data && res.data.length > 0) {
                // Find deposit wallet
                const depositWallet = res.data.find((w: any) => w.wallet_type === "deposit");
                if (depositWallet) {
                    setWalletBalance(depositWallet.balance_cents / 100);
                } else {
                    setWalletBalance(0);
                }
            }
        }
        fetchWallet();
    }, []);

    const handlePayAndReview = async () => {
        if (rating === 0) {
            setErrorMsg("Please select a rating for your driver.");
            return;
        }
        if (!comment.trim()) {
            setErrorMsg("Please write a quick comment review.");
            return;
        }
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            console.log(`Submitting review for trip ${tripId}: rating=${rating}, comment=${comment}`);
            const res = await submitTripReview(tripId, rating, comment);
            if (!res.success) {
                setErrorMsg(res.error || "Failed to submit review.");
                setIsSubmitting(false);
                return;
            }
            onPayment();
        } catch (e) {
            setErrorMsg("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    const isButtonDisabled = rating === 0 || !comment.trim() || isSubmitting;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-[#C69C2E] to-[#E5B84D]" />

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-[#C69C2E]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Ride Completed - Feedback Required</h2>
                            <p className="text-xs text-amber-700 font-semibold">Please rate your driver & leave feedback to complete trip</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Amount Card */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#C69C2E]/5 to-[#C69C2E]/10 border border-[#C69C2E]/15">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount to Pay</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#008751] flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold">₦</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Nigerian Naira</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    ₦{amountToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500 font-medium">Wallet Balance</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {walletBalance !== null ? `₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading..."}
                            </span>
                        </div>

                        {/* Rating and Review section */}
                        <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs font-bold text-gray-700">Leave a Review (Mandatory)</p>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform active:scale-95"
                                        disabled={isSubmitting}
                                    >
                                        <Star
                                            className={`w-6 h-6 ${
                                                star <= rating
                                                    ? "text-[#C69C2E] fill-[#C69C2E]"
                                                    : "text-gray-300 hover:text-[#C69C2E]"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Share your experience with this driver..."
                                className="w-full min-h-[60px] p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C69C2E] resize-none"
                            />
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 leading-relaxed">
                                    {errorMsg}
                                </p>
                            </div>
                        )}

                        {/* Security note */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            <span>Your review is shared with the driver profile</span>
                        </div>

                        <Button
                            onClick={handlePayAndReview}
                            disabled={isButtonDisabled}
                            className="w-full h-12 rounded-xl font-bold text-sm bg-[#C69C2E] hover:bg-[#b08b29] text-white transition-all hover:shadow-lg hover:shadow-[#C69C2E]/20"
                        >
                            {isSubmitting ? "Submitting Review & Payment..." : `Confirm & Pay ₦${amountToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
