"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Car, MapPin, Clock, Shield, DollarSign, Navigation, Users,
    Star, ArrowRight, ChevronRight, Sparkles, Route
} from "lucide-react";
import FallbackImage from "@/components/ui/FallbackImage";

const RIDE_STATS = [
    { icon: Users, value: "2,500+", label: "Active Drivers" },
    { icon: Route, value: "50,000+", label: "Rides Completed" },
    { icon: Star, value: "4.9", label: "Avg. Rating" },
];

const FEATURE_CARDS = [
    {
        icon: DollarSign,
        title: "Drive & Earn on Your Terms",
        desc: "Set your own schedule and earn competitive, transparent rates. Surge pricing rewards you during peak hours — your hustle, your rules.",
        color: "#10B981",
    },
    {
        icon: Clock,
        title: "Flexible & Stress-Free",
        desc: "Work full-time or part-time. Every trip you take on DGE Rides is a step towards your financial independence.",
        color: "#3B82F6",
    },
    {
        icon: Shield,
        title: "Community Safety First",
        desc: "Real-time GPS tracking, verified riders, an emergency SOS button, and 24/7 dedicated support. We protect our drivers and passengers equally.",
        color: "#F59E0B",
    },
];

function RideSimulator() {
    const [stage, setStage] = useState<'idle' | 'searching' | 'found' | 'arriving'>('idle');
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (stage === 'searching') {
            const dotInterval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 400);
            const timeout = setTimeout(() => setStage('found'), 2500);
            return () => { clearInterval(dotInterval); clearTimeout(timeout); };
        }
        if (stage === 'found') {
            const timeout = setTimeout(() => setStage('arriving'), 2000);
            return () => clearTimeout(timeout);
        }
        if (stage === 'arriving') {
            const timeout = setTimeout(() => setStage('idle'), 4000);
            return () => clearTimeout(timeout);
        }
    }, [stage]);

    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Card */}
            <div className="relative rounded-2xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl">

                {/* Mini map background */}
                <div className="h-44 relative overflow-hidden bg-gradient-to-b from-[#1a1815] to-[#0f0e0c]">
                    {/* Stylized road grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200">
                        {/* Horizontal roads */}
                        <line x1="0" y1="50" x2="400" y2="50" stroke="#C69C2E" strokeWidth="1" strokeDasharray="8 4" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#C69C2E" strokeWidth="1.5" />
                        <line x1="0" y1="150" x2="400" y2="150" stroke="#C69C2E" strokeWidth="1" strokeDasharray="8 4" />
                        {/* Vertical roads */}
                        <line x1="80" y1="0" x2="80" y2="200" stroke="#C69C2E" strokeWidth="1" strokeDasharray="8 4" />
                        <line x1="200" y1="0" x2="200" y2="200" stroke="#C69C2E" strokeWidth="1.5" />
                        <line x1="320" y1="0" x2="320" y2="200" stroke="#C69C2E" strokeWidth="1" strokeDasharray="8 4" />
                    </svg>

                    {/* Route line (animated) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                        <path
                            d="M 80 170 Q 120 130 200 100 Q 280 70 320 40"
                            fill="none"
                            stroke="#C69C2E"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            opacity="0.6"
                            className={stage !== 'idle' ? '' : 'opacity-0'}
                            style={{
                                transition: 'opacity 0.5s',
                                strokeDashoffset: stage !== 'idle' ? 0 : 100,
                            }}
                        />
                    </svg>

                    {/* Pickup pin */}
                    <div className="absolute bottom-6 left-[18%] flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                        <div className="w-px h-3 bg-green-400/50" />
                        <span className="text-[8px] text-green-400 font-semibold mt-0.5">YOU</span>
                    </div>

                    {/* Dropoff pin */}
                    <div className="absolute top-5 right-[18%] flex flex-col items-center">
                        <span className="text-[8px] text-primary font-semibold mb-0.5">DEST</span>
                        <div className="w-px h-3 bg-primary/50" />
                        <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
                    </div>

                    {/* Animated car (only when searching/found/arriving) */}
                    {stage !== 'idle' && (
                        <div
                            className="absolute transition-all duration-[2500ms] ease-in-out"
                            style={{
                                left: stage === 'arriving' ? '18%' : stage === 'found' ? '40%' : '70%',
                                top: stage === 'arriving' ? '65%' : stage === 'found' ? '50%' : '25%',
                            }}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-primary flex items-center justify-center shadow-lg glow-gold">
                                    <Car className="h-4 w-4 text-primary" />
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom controls */}
                <div className="p-4 space-y-3">
                    {/* Input fields */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-xs text-gray-300 flex-1">Victoria Island, Lagos</span>
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-gray-300 flex-1">Lekki Phase 1, Lagos</span>
                            <Navigation className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                    </div>

                    {/* Status / Button */}
                    {stage === 'idle' ? (
                        <button
                            onClick={() => setStage('searching')}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Car className="h-4 w-4" />
                            Request Ride
                        </button>
                    ) : stage === 'searching' ? (
                        <div className="w-full py-3 rounded-xl bg-white/5 border border-primary/20 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <div className="relative w-4 h-4">
                                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                                    <div className="absolute inset-0 rounded-full bg-primary/20" />
                                </div>
                                <span className="text-xs text-primary font-semibold">Finding your driver{dots}</span>
                            </div>
                        </div>
                    ) : stage === 'found' ? (
                        <div className="w-full py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                    AK
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">Driver Found!</p>
                                    <p className="text-[10px] text-green-400">Adebayo K. · ⭐ 4.9 · Toyota Camry</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white">₦2,450</p>
                                    <p className="text-[10px] text-gray-400">est. fare</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-white">Arriving in 3 min</span>
                                </div>
                                <span className="text-[10px] text-gray-400 animate-pulse">Live tracking</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Decorative glow behind card */}
            <div className="absolute -inset-8 bg-primary/5 rounded-3xl blur-3xl -z-10" />
        </div>
    );
}

export function DrivingSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const isLoggedIn = !!session?.backendToken;

    const handleCtaClick = (callbackPath: string = "/dashboard/driving") => {
        if (isLoggedIn) {
            router.push(callbackPath);
        } else {
            router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden" style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #111010 100%)" }}>
            {/* Grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-40" />

            <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-[1600px]">

                {/* Hero Banner */}
                <div className={`relative rounded-[2rem] overflow-hidden min-h-[350px] md:min-h-[420px] flex items-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="absolute inset-0">
                        <FallbackImage
                            src="/images/dge_driving_hero.jpg"
                            alt="DGE Rides Driver"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
                    </div>

                    <div className="relative z-10 p-5 sm:p-8 md:p-16 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 mb-6">
                            <Car className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary tracking-wider uppercase">DGE Rides</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            Travel Safe.<br /><span className="text-gradient-gold">Travel with DGE.</span>
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                            DGE Rides is not just a taxi service — it is a trusted community of verified drivers committed to getting you where you need to go safely and comfortably. Or join as a driver and be part of something bigger.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8">
                            {RIDE_STATS.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 flex items-center justify-center">
                                        <stat.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-bold text-white">{stat.value}</p>
                                        <p className="text-[9px] md:text-[10px] text-gray-400">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Ride Simulator + Content */}
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20 mb-20">
                    {/* Left: Content */}
                    <div className={`flex-1 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            See how fast we find
                            <br />
                            <span className="text-gray-400">your trusted driver</span>
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                            Every DGE Rides driver is background-checked and community-rated. Try our live simulator and experience a booking from start to finish — fast, safe, and completely transparent.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { text: "Matched with a driver in under 30 seconds", icon: "⚡" },
                                { text: "Real-time GPS tracking on every trip", icon: "📍" },
                                { text: "Cashless payment with upfront pricing", icon: "💳" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-sm text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => handleCtaClick("/dashboard/driving")} className="bg-primary hover:bg-primary/90 text-white px-6 py-5 rounded-xl text-sm font-semibold">
                                Book a Ride
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                            <Button onClick={() => handleCtaClick("/dashboard/driving")} variant="outline" className="border-white/20 text-black hover:bg-white/10 hover:text-white px-6 py-5 rounded-xl text-sm">
                                Become a Driver
                            </Button>
                        </div>
                    </div>

                    {/* Right: Ride Simulator */}
                    <div className={`flex-1 flex justify-center transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <RideSimulator />
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {FEATURE_CARDS.map((card, i) => (
                        <div
                            key={i}
                            className="group p-6 md:p-8 rounded-2xl glassmorphic hover:bg-white/8 transition-all duration-500 tilt-card cursor-pointer"
                            style={{
                                transitionDelay: `${i * 100}ms`,
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `${card.color}15`,
                                    border: `1px solid ${card.color}25`,
                                }}
                            >
                                <card.icon className="h-6 w-6" style={{ color: card.color }} />
                            </div>
                            <h4 className="text-base md:text-lg font-bold text-white mb-2">{card.title}</h4>
                            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Driver CTA Strip */}
                <div className={`mt-16 p-6 md:p-10 rounded-2xl relative overflow-hidden transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ background: 'linear-gradient(135deg, #1a1710 0%, #0f0e0a 100%)' }}>
                    {/* Animated road lines */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute left-1/4 top-0 w-px h-full bg-primary" style={{ animation: 'roadMove 2s linear infinite' }} />
                        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-primary" style={{ animation: 'roadMove 2s linear infinite 0.5s' }} />
                        <div className="absolute left-3/4 top-0 w-px h-full bg-primary" style={{ animation: 'roadMove 2s linear infinite 1s' }} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Ready to join the DGE Rides community?</h3>
                            <p className="text-sm text-gray-400">Thousands of drivers and riders are already part of the trusted DGE SPACE ecosystem.</p>
                        </div>
                        <Button onClick={() => handleCtaClick("/dashboard/driving")} className="bg-primary hover:bg-primary/90 text-white px-8 py-5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                            <Sparkles className="h-4 w-4" />
                            Become a Driver
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
