"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQS = [
    {
        q: "How does the Escrow payment system work?",
        a: "When you hire a professional on DGE SPACE, your payment is held securely in Escrow and not with the service provider. The funds are only released to them after you confirm that the work has been completed to your satisfaction. If there is a dispute, our team steps in to mediate fairly.",
    },
    {
        q: "How do I find and hire a service provider?",
        a: "Simply search for the service you need, browse verified providers or post a job, and use our built-in negotiation system to agree on a fair price. Once you are happy, confirm the booking and the Escrow is created automatically.",
    },
    {
        q: "Are the professionals on DGE SPACE verified?",
        a: "Yes. Every service provider on DGE SPACE goes through a thorough background check and KYC (Know Your Customer) verification before they can offer services. You can also see their community ratings and client reviews before hiring.",
    },
    {
        q: "What happens if I am not satisfied with the completed work?",
        a: "Your payment is fully protected. If the work does not meet your expectations, you can request revisions or open a dispute. Our team will review the case and ensure a fair resolution. We hold the Escrow funds until the matter is resolved.",
    },
    {
        q: "How does DGE Rides work?",
        a: "DGE Rides is our built-in ride-hailing service. Simply open the app, enter your destination, and we will match you with a nearby verified driver. You can track your ride in real time, and payment is handled seamlessly through your DGE SPACE wallet.",
    },
    {
        q: "How do I withdraw my earnings as a freelancer or driver?",
        a: "Your earnings go directly into your DGE SPACE Earnings Wallet after each completed job or ride. You can request a withdrawal to your verified bank account at any time, and payments are processed promptly.",
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-border/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#C69C2E]/30">
            <button
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-sm md:text-base gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <span>{q}</span>
                <ChevronDown
                    className={`h-5 w-5 text-[#C69C2E] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

export function FAQSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69C2E] mb-3 text-center">Got Questions?</p>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
                <p className="text-center text-muted-foreground mb-12 text-sm max-w-xl mx-auto">
                    Everything you need to know about how DGE SPACE works — from Escrow payments to getting verified and booking a ride.
                </p>

                <div className="space-y-3">
                    {FAQS.map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}
