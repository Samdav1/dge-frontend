"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Clock, MapPin, Banknote, ShieldCheck, Check, X, RefreshCw } from "lucide-react";

export interface RideIntent {
    rider_id: string;
    rider_name?: string;
    rider_avatar?: string;
    trip_id?: string;
    type?: string;
    pickup: { lat: number; lng: number; address: string };
    dropoff: { lat: number; lng: number; address: string };
    distance_km: number;
    estimated_fare: number;
    negotiated_fare?: number | null;
    distance_to_pickup_km: number;
    is_global?: boolean;
}

interface IncomingRidesProps {
    rideRequests: RideIntent[];
    onAccept: (req: RideIntent) => void;
    onReject: (req: RideIntent) => void;
    onCounter?: (req: RideIntent, counterFare: number) => void;
    isCountryWide: boolean;
    onToggleCountryWide: (val: boolean) => void;
}

export function IncomingRides({ 
    rideRequests, 
    onAccept, 
    onReject, 
    onCounter,
    isCountryWide, 
    onToggleCountryWide 
}: IncomingRidesProps) {
    const [counteringTripId, setCounteringTripId] = React.useState<string | null>(null);
    const [counterFare, setCounterFare] = React.useState<string>("");

    if (rideRequests.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-gray-50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold text-gray-900">Incoming Requests</h2>
                    </div>
                    {/* Nearby vs Country Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Receive Country-Wide Requests</span>
                        <button
                            type="button"
                            onClick={() => onToggleCountryWide(!isCountryWide)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isCountryWide ? 'bg-[#C69C2E]' : 'bg-gray-200'}`}
                        >
                            <span className="sr-only">Toggle Country-Wide</span>
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCountryWide ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                        <Navigation className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">No incoming rides yet</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        Stay online and wait for riders to request a trip in your area.
                    </p>
                </div>
            </div>
        );
    }

    const handleSendCounter = (req: RideIntent) => {
        const fare = parseFloat(counterFare);
        if (req.trip_id && onCounter && !isNaN(fare) && fare > 0) {
            onCounter(req, fare);
            setCounteringTripId(null);
            setCounterFare("");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Incoming Requests</h2>
                        <p className="text-[10px] text-gray-400">Showing {rideRequests.length} riders</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] text-blue-700 font-medium">Live</span>
                    </div>
                </div>

                {/* Nearby vs Country Toggle */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Receive Country-Wide Requests</span>
                    <button
                        type="button"
                        onClick={() => onToggleCountryWide(!isCountryWide)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isCountryWide ? 'bg-[#C69C2E]' : 'bg-gray-200'}`}
                    >
                        <span className="sr-only">Toggle Country-Wide</span>
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCountryWide ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {rideRequests.map((req, i) => {
                    const isCounteringThis = req.trip_id && counteringTripId === req.trip_id;

                    return (
                        <div key={i} className={`p-4 rounded-xl border shadow-sm transition-all relative overflow-hidden group ${req.is_global ? 'border-indigo-100 bg-indigo-50/20 hover:border-indigo-300' : 'border-gray-100 bg-white hover:border-[#C69C2E]/30'}`}>
                            {req.trip_id && (
                                <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg">
                                    DIRECT REQUEST
                                </div>
                            )}
                            {!req.trip_id && req.is_global && (
                                <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg">
                                    COUNTRY-WIDE
                                </div>
                            )}
                            <div className="absolute top-0 right-0 p-3 text-right">
                                {req.negotiated_fare ? (
                                    <>
                                        <p className="text-sm font-bold text-green-600">₦{req.negotiated_fare.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold line-through">₦{req.estimated_fare.toLocaleString()}</p>
                                        <p className="text-[9px] text-[#C69C2E] font-bold">Rider Offer</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-gray-900">₦{req.estimated_fare.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Estimated Fare</p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#C69C2E]/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#C69C2E]">RD</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Rider Request</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {req.is_global ? (
                                            <span>Time depends on distance</span>
                                        ) : (
                                            <span>{Math.ceil(req.distance_to_pickup_km * 2)} min to pickup</span>
                                        )}
                                        <span>•</span>
                                        {req.is_global ? (
                                            <span>Long Distance</span>
                                        ) : (
                                            <span>{req.distance_to_pickup_km.toFixed(1)} km away</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex gap-3 ml-2 mb-4">
                                <div className="flex flex-col items-center pt-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#C69C2E] ring-2 ring-[#C69C2E]/10" />
                                    <div className="w-0.5 h-6 my-1 bg-gray-200" />
                                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-900 ring-2 ring-gray-900/10" />
                                </div>
                                <div className="space-y-4 pb-1 flex-1">
                                    <div>
                                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                                        <p className="text-xs text-gray-900 font-medium line-clamp-1">{req.pickup.address || `${req.pickup.lat.toFixed(4)}, ${req.pickup.lng.toFixed(4)}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Dropoff</p>
                                        <p className="text-xs text-gray-900 font-medium line-clamp-1">{req.dropoff.address || `${req.dropoff.lat.toFixed(4)}, ${req.dropoff.lng.toFixed(4)}`}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Counter Form or Buttons */}
                            {isCounteringThis ? (
                                <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-2.5">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Input your counter offer price</p>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={counterFare}
                                            onChange={(e) => setCounterFare(e.target.value)}
                                            placeholder={`Counter price (Estimated: ₦${req.estimated_fare})`}
                                            className="h-10 text-xs bg-white border-gray-200 rounded-lg flex-1 focus:ring-[#C69C2E]/20"
                                        />
                                        <Button
                                            onClick={() => handleSendCounter(req)}
                                            disabled={!counterFare || isNaN(parseFloat(counterFare)) || parseFloat(counterFare) <= 0}
                                            className="h-10 px-3 bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-lg flex items-center justify-center gap-1 text-xs"
                                        >
                                            <Check className="w-4 h-4" /> Send
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setCounteringTripId(null);
                                                setCounterFare("");
                                            }}
                                            className="h-10 px-3 border-gray-200 rounded-lg flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => onReject(req)}
                                        variant="outline"
                                        className="flex-1 text-xs h-10 border-gray-200 text-gray-600 hover:bg-gray-50"
                                    >
                                        Decline
                                    </Button>

                                    {req.trip_id && (
                                        <Button
                                            onClick={() => {
                                                setCounteringTripId(req.trip_id!);
                                                setCounterFare(String(req.negotiated_fare || req.estimated_fare));
                                            }}
                                            variant="outline"
                                            className="flex-1 text-xs h-10 border-[#C69C2E]/30 text-[#C69C2E] hover:bg-[#C69C2E]/5"
                                        >
                                            Counter Offer
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => onAccept(req)}
                                        className="flex-1 text-xs h-10 bg-[#C69C2E] hover:bg-[#b08b29] text-white"
                                    >
                                        Accept Ride
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
