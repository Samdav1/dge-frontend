"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createNegotiation } from "@/features/negotiation/actions";
import { useStatusModal } from "@/app/admin/components/StatusModalProvider";

interface NegotiationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    initialPrice: string;
    serviceId: string;
    receiverId: string;
}

export function NegotiationModal({ isOpen, onClose, onSubmit, initialPrice, serviceId, receiverId }: NegotiationModalProps) {
    const [negotiationPrice, setNegotiationPrice] = useState("");
    const [message, setMessage] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("platform");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { showModal } = useStatusModal();

    const handleSubmit = async () => {
        if (!negotiationPrice || isNaN(Number(negotiationPrice))) {
            setErrorMsg("Please enter a valid negotiation price");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            // Convert price to cents
            const priceInCents = Math.round(Number(negotiationPrice) * 100);

            const result = await createNegotiation({
                service_id: serviceId,
                receiver_id: receiverId,
                proposed_price_cents: priceInCents,
                message: message || undefined,
                payment_method: paymentMethod,
            });

            if (result.success) {
                setNegotiationPrice("");
                setMessage("");
                setPaymentMethod("platform");
                onSubmit();
            } else {
                setErrorMsg(result.error || "Failed to create negotiation");
            }
        } catch (err) {
            console.error("Negotiation error:", err);
            setErrorMsg("An unexpected error occurred while submitting your negotiation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setNegotiationPrice("");
        setMessage("");
        setPaymentMethod("platform");
        setErrorMsg(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Make Negotiation</DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm mt-2">
                        Enter your proposed price for this service. The seller will be notified of your offer.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium leading-relaxed">
                            {errorMsg}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="initial-price" className="text-gray-700 font-medium">Initial Price</Label>
                        <Input
                            id="initial-price"
                            value={initialPrice}
                            readOnly
                            className="bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="negotiation-price" className="text-gray-700 font-medium">Negotiation Price (₦)</Label>
                        <Input
                            id="negotiation-price"
                            type="number"
                            value={negotiationPrice}
                            onChange={(e) => setNegotiationPrice(e.target.value)}
                            placeholder="Enter negotiation price"
                            className="bg-white border-gray-200 text-gray-900 h-12 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-method" className="text-gray-700 font-medium">Payment Method</Label>
                        <select
                            id="payment-method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-900 h-12 rounded-xl px-3 outline-none focus:border-[#C69C2E] text-sm"
                        >
                            <option value="platform">Platform Wallet</option>
                            <option value="cash">Offline (Cash) Payment</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-gray-700 font-medium">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter message"
                            className="bg-white border-gray-200 text-gray-900 min-h-[100px] rounded-xl resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl bg-[#C69C2E] hover:bg-[#B08B29] text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Make Negotiation"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
