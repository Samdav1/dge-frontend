"use client";

import { Card } from "@/components/ui/card";
import { Lock, BadgeCheck, MessageSquare, Wallet } from "lucide-react";

const VALUE_PROPS = [
    {
        icon: Lock,
        title: "Escrow-Protected Payments",
        desc: "Your money is held safely in Escrow and only released to the service provider after you confirm you are satisfied. Zero risk, guaranteed.",
        color: "#C69C2E",
    },
    {
        icon: BadgeCheck,
        title: "Verified Professionals",
        desc: "Every service provider on DGE SPACE is vetted and reviewed by real clients. Hire with confidence, every single time.",
        color: "#10B981",
    },
    {
        icon: MessageSquare,
        title: "Fair & Open Negotiations",
        desc: "Don't settle for a fixed price. Use our built-in negotiation system to agree on a fair price directly with your provider.",
        color: "#3B82F6",
    },
    {
        icon: Wallet,
        title: "Instant Wallet & Payouts",
        desc: "Fund your wallet, track your spending, and withdraw your earnings instantly. Your money, always in your control.",
        color: "#8B5CF6",
    },
];

export function ValuePropsSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px] text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69C2E] mb-3">Why DGE SPACE</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-14 text-base leading-relaxed">
                    We have built every feature with one goal in mind: to make sure every interaction on DGE SPACE is safe, fair, and rewarding for everyone involved.
                </p>
                <div className="grid md:grid-cols-4 gap-6">
                    {VALUE_PROPS.map((item, i) => (
                        <Card
                            key={i}
                            className="p-6 text-left hover:shadow-lg transition-all duration-300 border hover:border-[#C69C2E]/30 group rounded-2xl bg-white dark:bg-[#141414]"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                                style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                            >
                                <item.icon className="h-5 w-5" style={{ color: item.color }} />
                            </div>
                            <h3 className="text-base font-bold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
