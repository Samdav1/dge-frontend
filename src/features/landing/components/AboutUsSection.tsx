import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/ui/FallbackImage";
import { ShieldCheck, Users, Sparkles } from "lucide-react";

const TRUST_PILLARS = [
    {
        icon: ShieldCheck,
        title: "Built on Trust",
        desc: "Every transaction is protected by our secure Escrow system. Funds are only released when you approve the work.",
        color: "#C69C2E",
    },
    {
        icon: Users,
        title: "A United Community",
        desc: "We are more than a marketplace. DGE SPACE is a community where providers and clients grow together.",
        color: "#10B981",
    },
    {
        icon: Sparkles,
        title: "Unique Experiences",
        desc: "Whether you are hiring talent, offering services, or requesting a ride — every experience is designed to feel premium.",
        color: "#3B82F6",
    },
];

export function AboutUsSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <div className="bg-[#FFFBF0] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 mb-16">
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69C2E] mb-4">Our Mission</p>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                            More Than a Platform.<br />
                            <span className="text-[#C69C2E]">A World of Your Own.</span>
                        </h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed text-base">
                            At DGE SPACE, serve or get served; we bring you every connections that matters. Connecting you with real people to serve your needs.
                        </p>
                        <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                            We did not just build a space, we built an ecosystem community of verified users; professionals, freelancers and clients, anchored in <strong>trust, unique experiences, and reliability</strong>.
                        </p>
                        <Button variant="default" className="bg-[#C69C2E] hover:bg-[#B58B1D] text-white px-8 py-5 rounded-xl font-semibold">Join DGE SPACE Today</Button>
                    </div>
                    <div className="flex-1">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <FallbackImage
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                                alt="DGE SPACE Community"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Trust Pillars */}
                <div className="grid md:grid-cols-3 gap-6">
                    {TRUST_PILLARS.map((pillar, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all duration-300 hover:border-[#C69C2E]/30 group"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                                style={{ background: `${pillar.color}15`, border: `1px solid ${pillar.color}30` }}
                            >
                                <pillar.icon className="h-6 w-6" style={{ color: pillar.color }} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
