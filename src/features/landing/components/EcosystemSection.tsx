"use client";

import { useEffect, useRef, useState } from "react";
import {
    Droplet, Wrench, Zap, Car, Brush, Camera, Truck, GraduationCap,
    Search, Users, CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";

const ORBIT_ICONS = [
    { icon: Droplet, label: "Plumbing", color: "#3B82F6" },
    { icon: Wrench, label: "Repairs", color: "#EF4444" },
    { icon: Zap, label: "Electrical", color: "#F59E0B" },
    { icon: Car, label: "Driving", color: "#0EA5E9" },
    { icon: Brush, label: "Cleaning", color: "#10B981" },
    { icon: Camera, label: "Photo", color: "#E11D48" },
    { icon: Truck, label: "Moving", color: "#6366F1" },
    { icon: GraduationCap, label: "Tutoring", color: "#14B8A6" },
];

const STEPS = [
    {
        icon: Search,
        num: "01",
        title: "Search",
        desc: "Tell us what you need. Type any service and our AI finds the best match near you.",
        color: "#C69C2E",
    },
    {
        icon: Users,
        num: "02",
        title: "Match",
        desc: "We connect you instantly with verified local providers. Review profiles, ratings & prices.",
        color: "#E5B84D",
    },
    {
        icon: CheckCircle2,
        num: "03",
        title: "Done",
        desc: "Service delivered to your satisfaction. Pay securely and leave a review for the community.",
        color: "#F5D78E",
    },
];

const STATS = [
    { value: "10,000+", label: "Service Providers" },
    { value: "200+", label: "Service Categories" },
    { value: "50,000+", label: "Happy Customers" },
    { value: "15+", label: "Cities Covered" },
];

function AnimatedCounter({ target, label }: { target: string; label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="text-center">
            <div
                className={`text-2xl md:text-4xl font-bold text-gradient-gold transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
                {target}
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">{label}</p>
        </div>
    );
}

export function EcosystemSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-cycle through steps
    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className="relative py-20 md:py-32 overflow-hidden"
            style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #141210 50%, #0a0a0a 100%)" }}
        >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 grid-pattern opacity-60" />

            {/* Ambient glow spots */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />

            <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-[1600px]">

                {/* Section Header */}
                <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary tracking-wider uppercase">The DGE Ecosystem</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        Your Digital<br />
                        <span className="text-shimmer">Neighborhood</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        One connected ecosystem that brings every local service to your fingertips.
                        Search, match, and get things done — all in one place.
                    </p>
                </div>

                {/* Orbital Visualization + Steps + Image — 3 Columns on Desktop */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 mb-20 md:mb-28">

                    {/* Left: Orbital Hub */}
                    <div className={`relative flex-shrink-0 w-[280px] h-[280px] md:w-[380px] md:h-[380px] transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border border-white/5" />
                        {/* Middle ring */}
                        <div className="absolute inset-[15%] rounded-full border border-white/8" />
                        {/* Inner ring */}
                        <div className="absolute inset-[30%] rounded-full border border-primary/15" />

                        {/* Center hub */}
                        <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center glow-gold-strong">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">DGE</div>
                                <div className="text-[8px] md:text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Ecosystem</div>
                            </div>
                        </div>

                        {/* Orbiting icons */}
                        {ORBIT_ICONS.map((item, i) => {
                            const angle = (i / ORBIT_ICONS.length) * 360;
                            const radius = 42; // percentage from center
                            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                            return (
                                <div
                                    key={i}
                                    className="absolute transition-all duration-500"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: "translate(-50%, -50%)",
                                        animation: isVisible ? `float ${3 + (i % 3)}s ease-in-out infinite ${i * 0.3}s` : 'none',
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center group cursor-pointer transition-all duration-300 hover:scale-125"
                                        style={{
                                            background: `${item.color}15`,
                                            border: `1px solid ${item.color}30`,
                                            boxShadow: `0 0 12px ${item.color}15`,
                                        }}
                                    >
                                        <item.icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: item.color }} />
                                    </div>
                                    {/* Connection line to center */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: '50%', top: '50%', width: '2px', height: '2px' }}>
                                    </svg>
                                </div>
                            );
                        })}

                        {/* Dashed connection lines (decorative) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                            {ORBIT_ICONS.map((_, i) => {
                                const angle = (i / ORBIT_ICONS.length) * 360;
                                const radius = 42;
                                const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                                const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                                return (
                                    <line
                                        key={i}
                                        x1="50" y1="50" x2={x} y2={y}
                                        stroke="rgba(198,156,46,0.12)"
                                        strokeWidth="0.3"
                                        strokeDasharray="2 2"
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {/* Right: 3-Step Flow */}
                    <div className="flex-1 max-w-xl">
                        <h3 className={`text-xl md:text-2xl font-bold text-white mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            How It Works
                        </h3>

                        <div className="space-y-6">
                            {STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className={`relative flex items-start gap-4 md:gap-6 p-4 md:p-5 rounded-2xl transition-all duration-500 cursor-pointer ${activeStep === i ? 'bg-white/5 border border-primary/20 glow-gold' : 'bg-transparent border border-transparent hover:bg-white/3'}`}
                                    style={{
                                        transitionDelay: `${400 + i * 150}ms`,
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
                                    }}
                                    onClick={() => setActiveStep(i)}
                                >
                                    {/* Step number + icon */}
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeStep === i ? 'scale-110' : ''}`}
                                            style={{
                                                background: activeStep === i ? `${step.color}20` : 'rgba(255, 255, 255, 0.05)',
                                                border: `1.5px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                            }}
                                        >
                                            <step.icon
                                                className="h-5 w-5 md:h-6 md:w-6"
                                                style={{ color: activeStep === i ? step.color : '#666' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-primary/50 tracking-widest">{step.num}</span>
                                            <h4 className="text-sm md:text-base font-bold text-white">{step.title}</h4>
                                        </div>
                                        <p className={`text-xs md:text-sm leading-relaxed transition-colors ${activeStep === i ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {step.desc}
                                        </p>
                                    </div>

                                    {/* Active indicator */}
                                    {activeStep === i && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                                        </div>
                                    )}

                                    {/* Connecting line to next step */}
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute left-[2.2rem] md:left-[2.6rem] -bottom-3 w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Portrait Image */}
                    <div className={`hidden lg:block flex-shrink-0 w-[300px] xl:w-[340px] h-[450px] xl:h-[480px] relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                        <FallbackImage 
                            src="/images/professional_service_provider.jpg" 
                            alt="Professional Local Service Provider" 
                            className="relative z-10 w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Stats Bar */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-6 md:p-10 rounded-2xl glassmorphic transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    {STATS.map((stat, i) => (
                        <AnimatedCounter key={i} target={stat.value} label={stat.label} />
                    ))}
                </div>
            </div>
        </section>
    );
}
