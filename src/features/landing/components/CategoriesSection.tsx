"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Droplet, Wrench, Laptop, Zap, Brush, Truck, Hammer, PaintBucket,
    ChevronRight
} from "lucide-react";

const SERVICES_PREVIEW = [
    { icon: Droplet, label: "Plumbing", color: "#3B82F6" },
    { icon: Wrench, label: "Repairs", color: "#EF4444" },
    { icon: Laptop, label: "Tech", color: "#8B5CF6" },
    { icon: Zap, label: "Electrical", color: "#F59E0B" },
    { icon: Brush, label: "Cleaning", color: "#10B981" },
    { icon: Truck, label: "Moving", color: "#6366F1" },
    { icon: Hammer, label: "Carpentry", color: "#D97706" },
    { icon: PaintBucket, label: "Painting", color: "#EC4899" },
];

export function CategoriesSection() {
    const router = useRouter();
    const { data: session } = useSession();
    const isLoggedIn = !!session?.backendToken;

    const handleViewAll = () => {
        if (isLoggedIn) {
            router.push("/dashboard/marketplace");
        } else {
            router.push("/login?callbackUrl=/dashboard/marketplace");
        }
    };

    return (
        <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Your Ecosystem</p>
                    <h2 className="text-2xl md:text-3xl font-bold">Explore Our Services</h2>
                    <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">From home repairs to creative freelancers — every service you need, all in one trusted place.</p>
                </div>

                {/* Icon Grid — 3 columns */}
                <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
                    {SERVICES_PREVIEW.map((svc, i) => (
                        <div
                            key={i}
                            className="group flex flex-col items-center gap-2 md:gap-3"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div
                                className="relative w-14 h-14 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `${svc.color}12`,
                                    border: `1.5px solid ${svc.color}25`,
                                }}
                            >
                                <svc.icon
                                    className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110"
                                    style={{ color: svc.color }}
                                />
                                {/* Glow on hover */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ boxShadow: `0 0 20px ${svc.color}30, 0 0 40px ${svc.color}15` }}
                                />
                            </div>
                            <span className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                                {svc.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* View All Button — redirects to marketplace or login */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleViewAll}
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground/5 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    >
                        <span className="text-sm font-semibold text-foreground">View All Services</span>
                        <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </section>
    );
}
