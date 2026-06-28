"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Zap, ShieldCheck, CreditCard, ArrowRight, Sparkles } from "lucide-react";

const USE_CASES = [
    { emoji: "🔧", text: "Need a plumber urgently?", sub: "Matched with a verified pro 1.5km away" },
    { emoji: "🚗", text: "Booking a DGE Ride?", sub: "Driver arriving in 4 min — ₦1,200 est." },
    { emoji: "🍽️", text: "Hiring a caterer for your event?", sub: "12 vetted options near you — negotiate now" },
    { emoji: "💻", text: "Need a web developer?", sub: "5 top freelancers ready — Escrow-protected" },
    { emoji: "📸", text: "Looking for a photographer?", sub: "8 verified pros available this weekend" },
];

const FEATURES = [
    {
        icon: Globe,
        title: "Everything, Everywhere",
        desc: "From local home services to national freelance talent — your entire service ecosystem, in one place.",
        color: "#3B82F6",
    },
    {
        icon: Zap,
        title: "Instant Smart Matching",
        desc: "Our system connects you with the most relevant, available provider in seconds. No scrolling, no guessing.",
        color: "#F59E0B",
    },
    {
        icon: ShieldCheck,
        title: "Trust is Our Foundation",
        desc: "Verified providers, community reviews, and Escrow-backed transactions ensure every interaction is safe.",
        color: "#10B981",
    },
    {
        icon: CreditCard,
        title: "Pay When Satisfied",
        desc: "Funds are held securely in Escrow and released only when you approve the work. Your satisfaction is guaranteed.",
        color: "#8B5CF6",
    },
];

export function PlatformVisionSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeUseCase, setActiveUseCase] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Cycle through use cases
    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setActiveUseCase(prev => (prev + 1) % USE_CASES.length);
        }, 2800);
        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className="relative py-20 md:py-32 overflow-hidden"
            style={{ background: "#0D0D0D" }}
        >
            {/* Dot pattern */}
            <div className="absolute inset-0 dot-pattern opacity-40" />

            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px]" />

            <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-[1600px]">

                {/* Top: Vision Statement + Use Case Cards */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-20 md:mb-28">

                    {/* Left: Big Typography */}
                    <div className={`flex-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary tracking-wider uppercase">Platform Vision</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                            One World.<br />
                            Every Service.<br />
                            <span className="text-gradient-gold">Your Community.</span>
                        </h2>

                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mb-8">
                            DGE SPACE is a unified ecosystem where every service, every transaction, and every relationship is built on a foundation of <strong className="text-white">trust, unity, and unique experiences</strong>. You are at the center of everything we do.
                        </p>

                        <button className="group inline-flex items-center gap-3 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                            Join Our Community
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    {/* Right: Animated Use Case Cards */}
                    <div className={`flex-1 w-full max-w-md transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="relative h-[300px] md:h-[340px]">
                            {USE_CASES.map((uc, i) => {
                                const isActive = i === activeUseCase;
                                const isPrev = i === (activeUseCase - 1 + USE_CASES.length) % USE_CASES.length;
                                const isNext = i === (activeUseCase + 1) % USE_CASES.length;

                                return (
                                    <div
                                        key={i}
                                        className="absolute inset-x-0 transition-all duration-700 ease-out"
                                        style={{
                                            opacity: isActive ? 1 : isPrev || isNext ? 0.25 : 0,
                                            transform: isActive
                                                ? 'translateX(0) scale(1)'
                                                : isPrev
                                                    ? 'translateX(-80px) scale(0.92)'
                                                    : isNext
                                                        ? 'translateX(80px) scale(0.92)'
                                                        : 'translateX(40px) scale(0.85)',
                                            zIndex: isActive ? 10 : 1,
                                            top: '50%',
                                            marginTop: '-60px',
                                        }}
                                    >
                                        <div
                                            className={`p-6 md:p-8 rounded-2xl border-2 transition-all duration-500 ${isActive ? 'border-[#C69C2E]/50' : 'border-white/5 bg-white/[0.03]'}`}
                                            style={isActive ? {
                                                background: 'linear-gradient(135deg, rgba(198,156,46,0.85) 0%, rgba(180,130,20,0.75) 40%, rgba(198,156,46,0.65) 100%)',
                                                boxShadow: '0 0 30px rgba(198,156,46,0.4), 0 0 60px rgba(198,156,46,0.2), 0 0 100px rgba(198,156,46,0.1), 0 8px 32px rgba(0,0,0,0.3)',
                                            } : {}}
                                        >
                                            <div className={`text-4xl md:text-5xl mb-4 ${isActive ? 'drop-shadow-lg' : ''}`}>{uc.emoji}</div>
                                            <h3 className={`text-lg md:text-xl font-bold mb-2 ${isActive ? 'text-white drop-shadow-md' : 'text-white/70'}`}>{uc.text}</h3>
                                            <p className={`text-sm flex items-center gap-2 font-medium ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                                                <span className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse shadow-sm shadow-white/50' : 'bg-green-400/50'}`} />
                                                {uc.sub}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination dots */}
                        <div className="flex justify-center gap-2 mt-4">
                            {USE_CASES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveUseCase(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === activeUseCase ? 'bg-primary w-6' : 'bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom: Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {FEATURES.map((feat, i) => (
                        <div
                            key={i}
                            className="group p-5 md:p-6 rounded-2xl glassmorphic hover:bg-white/8 transition-all duration-500 tilt-card cursor-pointer"
                            style={{
                                transitionDelay: `${i * 100}ms`,
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                            }}
                        >
                            <div
                                className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `${feat.color}15`,
                                    border: `1px solid ${feat.color}25`,
                                }}
                            >
                                <feat.icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: feat.color }} />
                            </div>
                            <h4 className="text-sm md:text-base font-bold text-white mb-2">{feat.title}</h4>
                            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
