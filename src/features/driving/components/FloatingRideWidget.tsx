"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Car, X, MapPin, Clock, ChevronUp, Bell, ArrowRight } from "lucide-react";
import { getActiveTrip } from "@/features/driving/actions";

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

    const [tripData, setTripData] = useState<TripData | null>(null);
    const [tripStatus, setTripStatus] = useState<TripStatus>("idle");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const [lastSeenTripId, setLastSeenTripId] = useState<string | null>(null);

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

                // Map backend status to our local status
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

                // Show notification if new trip
                if (trip.id !== lastSeenTripId) {
                    setHasNotification(true);
                    setLastSeenTripId(trip.id);
                    // If there's a new active trip, un-dismiss the widget
                    setIsDismissed(false);
                }
            } else {
                setTripData(null);
                setTripStatus("idle");
            }
        } catch (err) {
            // Silently fail polling — keep widget visible in idle state
            console.debug("Ride widget poll error:", err);
        }
    }, [isLoggedIn, lastSeenTripId]);

    // Poll every 15 seconds
    useEffect(() => {
        if (!isLoggedIn) return;

        pollTrip();
        const interval = setInterval(pollTrip, 15000);
        return () => clearInterval(interval);
    }, [isLoggedIn, pollTrip]);

    // Don't render if not logged in or dismissed
    if (!isLoggedIn) return null;
    if (isDismissed && tripStatus === "idle") return null;

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        setHasNotification(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        setIsExpanded(false);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsMinimized(false);
        setIsExpanded(false);
    };

    // Minimized state — just a floating car icon
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#C69C2E]/40 shadow-2xl shadow-[#C69C2E]/20 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-[#C69C2E]/60 group"
            >
                <Car className="w-6 h-6 text-[#C69C2E] transition-transform group-hover:scale-110" />
                {hasNotification && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-[8px] text-white font-bold">!</span>
                    </span>
                )}
            </button>
        );
    }

    const statusConfig: Record<TripStatus, { label: string; color: string; bg: string; animate: boolean }> = {
        idle: { label: "No Active Ride", color: "text-gray-400", bg: "bg-gray-500/10", animate: false },
        active: { label: "Ride Requested", color: "text-[#C69C2E]", bg: "bg-[#C69C2E]/10", animate: true },
        arriving: { label: "Driver Arriving", color: "text-blue-400", bg: "bg-blue-500/10", animate: true },
        in_progress: { label: "Ride In Progress", color: "text-green-400", bg: "bg-green-500/10", animate: true },
        completed: { label: "Ride Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", animate: false },
    };

    const config = statusConfig[tripStatus];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[calc(100vw-3rem)]">
            {/* Main Card */}
            <div
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(198, 156, 46, 0.1)",
                }}
            >
                {/* Header — always visible */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={handleExpand}
                >
                    <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                            <Car className={`w-5 h-5 ${config.color}`} />
                            {config.animate && (
                                <span className="absolute inset-0 rounded-xl border border-current opacity-30 animate-ping" style={{ color: config.color.replace('text-', '') }} />
                            )}
                            {hasNotification && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                                    <Bell className="w-2 h-2 text-white" />
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">DGE Rides</p>
                            <p className={`text-[10px] font-semibold ${config.color}`}>{config.label}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                            title="Minimize"
                        >
                            <ChevronUp className="w-3.5 h-3.5 rotate-180" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                            title="Dismiss"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                        {tripData ? (
                            <>
                                {/* Route info */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-green-400 shrink-0" />
                                        <p className="text-xs text-gray-300 line-clamp-1">{tripData.pickup_address}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-[#C69C2E] shrink-0" />
                                        <p className="text-xs text-gray-300 line-clamp-1">{tripData.dropoff_address}</p>
                                    </div>
                                </div>

                                {/* Trip details */}
                                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                    {tripData.driver_name && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                {tripData.driver_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white">{tripData.driver_name}</p>
                                                <p className="text-[10px] text-gray-500">Driver</p>
                                            </div>
                                        </div>
                                    )}
                                    {tripData.fare && (
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">₦{tripData.fare.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500">Est. fare</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status indicator */}
                                {tripStatus === "arriving" && (
                                    <div className="flex items-center gap-2 text-xs text-blue-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">Driver is on the way</span>
                                        <span className="ml-auto text-[10px] text-gray-500 animate-pulse">Live</span>
                                    </div>
                                )}
                                {tripStatus === "in_progress" && (
                                    <div className="flex items-center gap-2 text-xs text-green-400">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="font-medium">Ride in progress</span>
                                        <span className="ml-auto text-[10px] text-gray-500 animate-pulse">Live</span>
                                    </div>
                                )}
                                {tripStatus === "completed" && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                                        <span className="font-medium">✓ Ride completed successfully</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Idle state — no active trip, show quick action */
                            <div className="space-y-3">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    No active ride right now. Need to go somewhere?
                                </p>
                                <button
                                    onClick={() => router.push("/dashboard/driving")}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 text-[#C69C2E] text-xs font-semibold hover:bg-[#C69C2E]/20 transition-colors cursor-pointer"
                                >
                                    <Car className="w-3.5 h-3.5" />
                                    Book a Ride
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
