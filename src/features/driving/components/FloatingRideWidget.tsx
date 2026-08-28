"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Car, X, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { getActiveTrip } from "@/features/driving/actions";
import { useChatContext } from "@/providers/ChatProvider";
import { playNotificationSound } from "@/lib/sound";

type TripStatus = "idle" | "active" | "arriving" | "in_progress" | "completed";

interface TripData {
    id: string;
    status: string;
    pickup_address?: string;
    dropoff_address?: string;
    driver_name?: string;
    estimated_arrival?: string;
    fare?: number;
}

export function FloatingRideWidget() {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.backendToken;
    const router = useRouter();
    const { latestNotification } = useChatContext();

    const [tripData, setTripData] = useState<TripData | null>(null);
    const [tripStatus, setTripStatus] = useState<TripStatus>("idle");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [lastSeenTripId, setLastSeenTripId] = useState<string | null>(null);
    const [statusChanged, setStatusChanged] = useState(false);
    const [isPulsingHorizontal, setIsPulsingHorizontal] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const prevStatusRef = useRef<TripStatus>("idle");

    // Helper to trigger the iPhone Dynamic Island horizontal expansion pop animation
    const triggerDynamicIslandPop = useCallback(() => {
        playNotificationSound();
        setIsPulsingHorizontal(true);
        setHasNotification(true);
        setStatusChanged(true);

        const timer = setTimeout(() => {
            setIsPulsingHorizontal(false);
        }, 1200);

        const highlightTimer = setTimeout(() => {
            setStatusChanged(false);
        }, 6000);

        return () => {
            clearTimeout(timer);
            clearTimeout(highlightTimer);
        };
    }, []);

    // Click outside to collapse
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Trigger iPhone style horizontal expansion pop when trip status changes
    useEffect(() => {
        if (tripStatus !== "idle" && tripStatus !== prevStatusRef.current) {
            triggerDynamicIslandPop();
            prevStatusRef.current = tripStatus;
        }
        prevStatusRef.current = tripStatus;
    }, [tripStatus, triggerDynamicIslandPop]);

    // Trigger iPhone style pop when global notification arrives
    useEffect(() => {
        if (latestNotification) {
            triggerDynamicIslandPop();
        }
    }, [latestNotification, triggerDynamicIslandPop]);

    // Poll for active trip
    const pollTrip = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            const result = await getActiveTrip();
            if (result.success && result.data) {
                const trip = result.data;
                setTripData({
                    id: trip.id || trip.trip_id,
                    status: trip.status,
                    pickup_address: trip.pickup_address || "Pickup location",
                    dropoff_address: trip.dropoff_address || "Drop-off location",
                    driver_name: trip.driver_name || trip.driver?.name,
                    estimated_arrival: trip.estimated_arrival,
                    fare: trip.fare || trip.final_fare || trip.negotiated_fare,
                });

                // Map backend status to local status
                const s = (trip.status || "").toLowerCase();
                if (s.includes("complet")) {
                    setTripStatus("completed");
                } else if (s.includes("start") || s.includes("in_progress") || s.includes("ongoing")) {
                    setTripStatus("in_progress");
                } else if (s.includes("arriv")) {
                    setTripStatus("arriving");
                } else {
                    setTripStatus("active");
                }

                // Show notification if new trip ID detected
                if (trip.id !== lastSeenTripId) {
                    setLastSeenTripId(trip.id);
                    setIsDismissed(false);
                    triggerDynamicIslandPop();
                }
            } else {
                setTripData(null);
                setTripStatus("idle");
            }
        } catch (err) {
            console.debug("Ride widget poll error:", err);
        }
    }, [isLoggedIn, lastSeenTripId, triggerDynamicIslandPop]);

    // Poll every 15 seconds
    useEffect(() => {
        if (!isLoggedIn) return;

        pollTrip();
        const interval = setInterval(pollTrip, 15000);
        return () => clearInterval(interval);
    }, [isLoggedIn, pollTrip]);

    if (!isLoggedIn) return null;
    if (isDismissed) return null;

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        setHasNotification(false);
        setStatusChanged(false);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsExpanded(false);
    };

    const statusConfig: Record<TripStatus, { label: string; color: string; bg: string; animate: boolean }> = {
        idle: { label: "Book Ride", color: "text-[#C69C2E]", bg: "bg-[#C69C2E]/10", animate: false },
        active: { label: "Requested", color: "text-[#C69C2E]", bg: "bg-[#C69C2E]/10", animate: true },
        arriving: { label: "Arriving", color: "text-blue-400", bg: "bg-blue-500/10", animate: true },
        in_progress: { label: "On Trip", color: "text-green-400", bg: "bg-green-500/10", animate: true },
        completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", animate: false },
    };

    const config = statusConfig[tripStatus];

    return (
        <div ref={containerRef} className="relative flex flex-col items-center">
            {/* Embedded Keyframes for authentic iPhone Dynamic Island spring expansion animation */}
            <style jsx>{`
                @keyframes islandExpandHorizontal {
                    0% {
                        transform: scale(1) scaleX(1);
                        max-width: 200px;
                    }
                    30% {
                        transform: scale(1.08) scaleX(1.35);
                        max-width: 320px;
                    }
                    60% {
                        transform: scale(0.97) scaleX(0.92);
                        max-width: 240px;
                    }
                    85% {
                        transform: scale(1.02) scaleX(1.04);
                        max-width: 270px;
                    }
                    100% {
                        transform: scale(1) scaleX(1);
                        max-width: 260px;
                    }
                }
                .animate-island-spring {
                    animation: islandExpandHorizontal 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>

            {/* Sleek Dynamic Island pill container */}
            <button
                onClick={handleExpand}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-full bg-black border transition-all duration-300 cursor-pointer select-none text-white max-w-[260px] md:max-w-xs ${
                    isPulsingHorizontal ? "animate-island-spring border-[#C69C2E] ring-4 ring-[#C69C2E]/30 shadow-[0_0_25px_rgba(198,156,46,0.6)]" : ""
                } ${
                    statusChanged 
                        ? "border-[#C69C2E] shadow-[0_0_15px_rgba(198,156,46,0.5)]" 
                        : "border-[#C69C2E]/40 shadow-lg shadow-black/80 hover:border-[#C69C2E]/80"
                }`}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    <Car className={`w-3.5 h-3.5 ${config.color}`} />
                    {config.animate && (
                        <>
                            <span className="absolute inset-0 rounded-full border border-current opacity-60 animate-ping" />
                            <span className="absolute -inset-1 rounded-full border border-current opacity-30 animate-pulse" />
                        </>
                    )}
                    {hasNotification && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center animate-bounce" />
                    )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-black tracking-wider uppercase truncate">
                        {tripStatus === "idle" ? "Book Ride" : `Ride ${config.label}`}
                    </span>
                    {tripData?.estimated_arrival && (
                        <span className="text-[8px] text-[#C69C2E] font-black bg-[#C69C2E]/10 border border-[#C69C2E]/20 px-1.5 py-0.5 rounded-full shrink-0">
                            {tripData.estimated_arrival}
                        </span>
                    )}
                </div>
            </button>

            {/* Dropdown expanded details card */}
            {isExpanded && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[310px] bg-gradient-to-br from-[#121215] to-[#0A0A0C] border border-[#C69C2E]/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(198,156,46,0.12)] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Tech Grid Background Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:10px_10px] opacity-40 rounded-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        {/* iPhone Style Notification Alert banner when status changes */}
                        {statusChanged && tripStatus !== "idle" && (
                            <div 
                                onClick={() => {
                                    setIsExpanded(false);
                                    router.push("/dashboard/driving");
                                }}
                                className="flex items-center justify-between gap-2 bg-[#C69C2E]/10 border border-[#C69C2E]/30 px-3 py-2 rounded-2xl animate-in slide-in-from-top duration-300 cursor-pointer hover:bg-[#C69C2E]/20 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Sparkles className="w-4 h-4 text-[#C69C2E] shrink-0 animate-spin" />
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-[#C69C2E] uppercase tracking-wider leading-none">Status Updated</p>
                                        <p className="text-[11px] text-white font-bold leading-tight mt-0.5 truncate">
                                            Your ride is now <span className="capitalize">{tripStatus}</span>!
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#C69C2E] flex items-center shrink-0">
                                    View <ArrowRight className="w-3 h-3 ml-0.5" />
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Car className={`w-4 h-4 ${config.color}`} />
                                <span className="text-xs font-black text-white tracking-widest uppercase">
                                    {tripStatus === "idle" ? "DGE Ride Booking" : "Active Trip Details"}
                                </span>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                                title="Dismiss"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {tripData ? (
                            <>
                                {/* Route info */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1 w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 border border-green-300/40" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pickup</p>
                                            <p className="text-xs text-gray-300 truncate mt-0.5">{tripData.pickup_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1 w-2.5 h-2.5 rounded-full bg-[#C69C2E] shrink-0 border border-[#C69C2E]/40" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dropoff</p>
                                            <p className="text-xs text-gray-300 truncate mt-0.5">{tripData.dropoff_address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver and Fare info */}
                                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-3 border border-white/5">
                                    {tripData.driver_name && (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C69C2E] to-[#997822] flex items-center justify-center text-xs font-black text-black shrink-0">
                                                {tripData.driver_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{tripData.driver_name}</p>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Driver</p>
                                            </div>
                                        </div>
                                    )}
                                    {tripData.fare && (
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-white">₦{tripData.fare.toLocaleString()}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Est. Fare</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status details */}
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                        {tripStatus === "arriving" && (
                                            <>
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-blue-400">Driver is arriving...</span>
                                            </>
                                        )}
                                        {tripStatus === "in_progress" && (
                                            <>
                                                <MapPin className="w-3.5 h-3.5 text-green-400" />
                                                <span className="text-green-400">Ride is ongoing</span>
                                            </>
                                        )}
                                        {tripStatus === "completed" && (
                                            <>
                                                <span className="text-emerald-400">✓ Ride completed</span>
                                            </>
                                        )}
                                        {tripStatus === "active" && (
                                            <>
                                                <span className="text-[#C69C2E]">Ride requested</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="ml-auto text-[9px] font-black text-[#C69C2E] bg-[#C69C2E]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                        Live
                                    </span>
                                </div>

                                {/* CTA Button to View Ride in Driving Section */}
                                <button
                                    onClick={() => {
                                        setIsExpanded(false);
                                        router.push("/dashboard/driving");
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C69C2E] to-[#E5B84D] hover:from-[#b08b29] hover:to-[#d4a83e] text-black font-black text-xs transition-all shadow-[0_0_15px_rgba(198,156,46,0.3)] cursor-pointer mt-2 uppercase tracking-wider group"
                                >
                                    <Car className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                                    <span>View Ride & Tracking</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
                                </button>
                            </>
                        ) : (
                            /* Idle state — no active trip */
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    No active ride right now. Need to go somewhere?
                                </p>
                                <button
                                    onClick={() => {
                                        setIsExpanded(false);
                                        router.push("/dashboard/driving");
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 text-[#C69C2E] text-xs font-semibold hover:bg-[#C69C2E]/20 transition-colors cursor-pointer"
                                >
                                    <Car className="w-3.5 h-3.5" />
                                    Book a Ride
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
