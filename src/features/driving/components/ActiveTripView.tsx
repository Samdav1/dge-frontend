"use client";

import React from "react";
import { Trip } from "../types";
import { Car, MapPin, Navigation, Phone, CheckCircle, XCircle, Route, User, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/providers/ChatProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createConversation, addParticipant, getCurrentUserId } from "../../inbox/actions";

interface ActiveTripViewProps {
    trip: Trip;
    isDriver: boolean;
    onCancel: (tripId: string) => void;
    onComplete?: (tripId: string) => void; // Only for drivers
    onArrive?: (tripId: string) => void;
    onStartTrip?: (tripId: string) => void;
    onConfirmStart?: (tripId: string) => void;
    driverLocation?: { lat: number; lng: number } | null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export function ActiveTripView({ trip, isDriver, onCancel, onComplete, onArrive, onStartTrip, onConfirmStart, driverLocation }: ActiveTripViewProps) {
    const { startOutboundCall } = useChatContext();
    const router = useRouter();
    const [isChatLoading, setIsChatLoading] = React.useState(false);

    let progress = 0;
    let distanceRemaining = trip.distance_km;
    let timeRemaining = Math.ceil(trip.distance_km * 2); // ~2 mins per km
    let isArrivedAtDestination = false;

    if (driverLocation) {
        if (trip.status === "en_route" || trip.status === "ACTIVE") {
            // Approaching pickup location
            const distToPickup = getDistance(driverLocation.lat, driverLocation.lng, trip.pickup_lat, trip.pickup_lng);
            distanceRemaining = distToPickup;
            progress = 0; // Don't show % progress for pickup phase
            timeRemaining = Math.ceil(distanceRemaining * 2);
        } else if (trip.status === "in_progress") {
            // Approaching dropoff location
            const distToDropoff = getDistance(driverLocation.lat, driverLocation.lng, trip.dropoff_lat, trip.dropoff_lng);
            distanceRemaining = Math.min(distToDropoff, trip.distance_km);
            progress = Math.min(Math.max(1 - (distanceRemaining / (trip.distance_km || 1)), 0), 1);
            timeRemaining = Math.ceil(distanceRemaining * 2);
            isArrivedAtDestination = progress >= 0.98;
        } else if (trip.status === "arrived" || trip.status === "awaiting_confirmation") {
            // At pickup location
            distanceRemaining = trip.distance_km;
            progress = 0;
            timeRemaining = Math.ceil(trip.distance_km * 2);
        }
    }

    const hasArrived = isArrivedAtDestination;

    const handleChat = async () => {
        const targetUserId = isDriver ? trip.rider_id : trip.driver_user_id;
        if (!targetUserId) {
            toast.error("Cannot start chat: user ID not available");
            return;
        }

        setIsChatLoading(true);
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return;

            const conversationResult = await createConversation({
                type: "private",
                recipient_id: targetUserId,
                metadataInfo: {
                    trip_id: trip.id,
                    type: "ride_chat"
                }
            });

            if (conversationResult.success && conversationResult.data) {
                const conversationId = conversationResult.data.id;
                
                await addParticipant({
                    conversation_id: conversationId,
                    user_id: targetUserId,
                    role: "member"
                });

                router.push(`/dashboard/inbox?conversationId=${conversationId}`);
            } else {
                toast.error("Failed to create chat");
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="bg-[#0D0D0D] px-5 py-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-[#C69C2E]/10 blur-[80px]" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {trip.status === "PENDING" ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                    Waiting for Driver
                                </>
                            ) : trip.status === "en_route" || trip.status === "ACTIVE" ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                    Driver is En Route
                                </>
                            ) : trip.status === "arrived" ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Driver has Arrived
                                </>
                            ) : trip.status === "awaiting_confirmation" ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                                    Waiting for Confirmation
                                </>
                            ) : trip.status === "in_progress" ? (
                                <>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                    Ride in Progress
                                </>
                            ) : (
                                "Ride Status"
                            )}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {isDriver ? "You are the driver" : "You are the passenger"}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 backdrop-blur-md">
                        {isDriver ? <User className="w-6 h-6 text-[#C69C2E]" /> : <Car className="w-6 h-6 text-[#C69C2E]" />}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
                {/* Arrival alert banner */}
                {trip.status === "ACTIVE" && hasArrived && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 animate-bounce">
                        <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-green-800">
                                {isDriver ? "You have reached the destination!" : "You have arrived!"}
                            </h4>
                            <p className="text-xs text-green-700 mt-0.5">
                                {isDriver 
                                    ? "Please notify the passenger and tap 'Complete Ride' to finish and submit the trip." 
                                    : "Thank you for riding with us. Your payment is being completed."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Waiting for driver to start banner */}
                {!isDriver && trip.status === "arrived" && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">Waiting for Driver</h4>
                            <p className="text-xs text-blue-700 mt-0.5">Your driver has arrived. Please meet them at the pickup location. The driver will initiate the trip start when you are ready.</p>
                        </div>
                    </div>
                )}

                {/* Real-time Progress Bar */}
                {(trip.status === "en_route" || trip.status === "ACTIVE" || trip.status === "in_progress") && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-500 uppercase tracking-wider">
                                {trip.status === "in_progress" ? "Trip Progress" : "Driver Approaching"}
                            </span>
                            {trip.status === "in_progress" && (
                                <span className="font-bold text-[#C69C2E]">{Math.round(progress * 100)}% Complete</span>
                            )}
                        </div>
                        {trip.status === "in_progress" && (
                            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#C69C2E] transition-all duration-500 ease-out rounded-full" 
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-center pt-1">
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase">
                                    {trip.status === "in_progress" ? "Remaining Distance" : "Distance to Pickup"}
                                </p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{distanceRemaining.toFixed(2)} km</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Est. Arrival Time</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{timeRemaining} mins</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Route */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Route className="w-4 h-4 text-[#C69C2E]" />
                        Trip Route
                    </h3>
                    <div className="relative pl-5 space-y-4">
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #e5e5e5 0px, #e5e5e5 3px, transparent 3px, transparent 6px)' }} />
                        
                        <div className="relative">
                            <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-[#C69C2E] bg-white" />
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Pickup</p>
                            <p className="text-sm text-gray-900 font-medium">
                                {trip.pickup_address || `${trip.pickup_lat.toFixed(4)}, ${trip.pickup_lng.toFixed(4)}`}
                            </p>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-sm border-2 border-gray-900 bg-white" />
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Dropoff</p>
                            <p className="text-sm text-gray-900 font-medium">
                                {trip.dropoff_address || `${trip.dropoff_lat.toFixed(4)}, ${trip.dropoff_lng.toFixed(4)}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Distance</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{trip.distance_km.toFixed(1)} <span className="text-sm font-medium text-gray-500">km</span></p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Estimated Fare</p>
                        <p className="text-lg font-bold text-[#C69C2E] mt-0.5">₦{trip.estimated_fare.toLocaleString()}</p>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {isDriver ? (
                                trip.rider_avatar ? (
                                    <img src={trip.rider_avatar.startsWith("http") ? trip.rider_avatar : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${trip.rider_avatar}`} alt={trip.rider_name || "Passenger"} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-500" />
                                )
                            ) : (
                                trip.driver_avatar ? (
                                    <img src={trip.driver_avatar.startsWith("http") ? trip.driver_avatar : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${trip.driver_avatar}`} alt={trip.driver_name || "Driver"} className="w-full h-full object-cover" />
                                ) : (
                                    <Car className="w-5 h-5 text-gray-500" />
                                )
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{isDriver ? (trip.rider_name || "Passenger") : (trip.driver_name || "Driver")}</p>
                            <p className="text-xs text-gray-400">Connected</p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full w-9 h-9 p-0 border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/10"
                        onClick={handleChat}
                        disabled={isChatLoading}
                    >
                        {isChatLoading ? <div className="w-4 h-4 border-2 border-[#C69C2E] border-t-transparent rounded-full animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50 flex gap-3">
                <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl font-bold"
                    onClick={() => onCancel(trip.id)}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Ride
                </Button>
                {isDriver && (trip.status === "en_route" || trip.status === "ACTIVE") && onArrive && (
                    <Button 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                        onClick={() => onArrive(trip.id)}
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        I have arrived
                    </Button>
                )}
                {isDriver && trip.status === "arrived" && onStartTrip && (
                    <Button 
                        className="flex-1 bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#C69C2E]/20"
                        onClick={() => onStartTrip(trip.id)}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Trip
                    </Button>
                )}
                {isDriver && trip.status === "in_progress" && onComplete && (
                    <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-green-600/20"
                        onClick={() => onComplete(trip.id)}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Ride
                    </Button>
                )}
                {!isDriver && trip.status === "awaiting_confirmation" && onConfirmStart && (
                    <Button 
                        className="flex-1 bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-bold shadow-lg shadow-[#C69C2E]/20 animate-pulse"
                        onClick={() => onConfirmStart(trip.id)}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Trip Start
                    </Button>
                )}
            </div>
        </div>
    );
}
