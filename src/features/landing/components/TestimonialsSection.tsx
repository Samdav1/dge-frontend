"use client";

import { Card } from "@/components/ui/card";
import FallbackImage from "@/components/ui/FallbackImage";
import { Star } from "lucide-react";

const TESTIMONIALS = [
    {
        avatar: "/images/chukwuemeka_obi.jpg",
        name: "Chukwuemeka Obi",
        role: "Business Owner, Lagos",
        quote:
            "I hired a web developer through DGE SPACE and the Escrow feature gave me total peace of mind. The funds were held securely until I approved the final product. I will never hire talent any other way.",
        stars: 5,
    },
    {
        avatar: "/images/amina_yusuf.jpg",
        name: "Amina Yusuf",
        role: "Freelance Designer, Abuja",
        quote:
            "As a freelancer, getting paid used to be my biggest worry. DGE SPACE's Escrow system means I always get paid for my work — no more chasing clients. The negotiation feature also lets me set fair prices.",
        stars: 5,
    },
    {
        avatar: "/images/taiwo_adeyinka.jpg",
        name: "Taiwo Adeyinka",
        role: "Daily Commuter, Port Harcourt",
        quote:
            "DGE Rides is by far the safest way I have traveled around the city. Verified drivers, real-time GPS tracking, and the price is always fair. It feels like a service that truly cares about its community.",
        stars: 5,
    },
];

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-0.5 mb-4">
            {Array.from({ length: count }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#C69C2E] text-[#C69C2E]" />
            ))}
        </div>
    );
}

export function TestimonialsSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69C2E] mb-3">Community Stories</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Thousands Across Nigeria</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-base">
                        Real people. Real experiences. See how DGE SPACE is changing the way people connect, work, and travel.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <Card key={i} className="p-5 sm:p-8 border hover:shadow-xl transition-all duration-300 hover:border-[#C69C2E]/30 rounded-2xl flex flex-col justify-between">
                            <div>
                                <StarRating count={t.stars} />
                                <p className="text-sm text-muted-foreground italic leading-relaxed mb-6">
                                    &quot;{t.quote}&quot;
                                </p>
                            </div>
                            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    <FallbackImage src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
