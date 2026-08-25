"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Clock, Loader2, Star, Shield, MapPin, Zap, ChevronRight } from "lucide-react";
import { getDriversNearby } from "../actions";
import { DriverNearbyResponse } from "../types";

interface DriversListProps {
    onBack: () => void;
    onContinue: (driver: DriverNearbyResponse) => void;
    tripDistance?: number;
    onViewDriverProfile: (driverId: string) => void;
    vehicleType?: string;
}

export function DriversList({ onBack, onContinue, tripDistance = 0, onViewDriverProfile, vehicleType }: DriversListProps) {
    const [drivers, setDrivers] = useState<DriverNearbyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            console.log("DriversList: fetchDrivers called, filtering by vehicleType:", vehicleType);
            try {
                if (navigator.geolocation) {
                    console.log("DriversList: requesting geolocation");
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            console.log("DriversList: geolocation success", position);
                            try {
                                const data = await getDriversNearby(
                                    position.coords.latitude,
                                    position.coords.longitude
                                );
                                console.log("DriversList: drivers fetched", data);
                                const filtered = vehicleType
                                    ? data.filter(d => d.supported_vehicles && d.supported_vehicles.map(v => v.toLowerCase()).includes(vehicleType.toLowerCase()))
                                    : data;
                                setDrivers(filtered);
                                setLoading(false);
                            } catch (err) {
                                console.error("DriversList: Failed to fetch drivers with location:", err);
                                setDrivers([]);
                                setLoading(false);
                            }
                        },
                        async (err) => {
                            console.warn("DriversList: Geolocation permission denied or failed:", err);
                            try {
                                console.log("DriversList: fetching with default location");
                                const data = await getDriversNearby(6.5244, 3.3792);
                                const filtered = vehicleType
                                    ? data.filter(d => d.supported_vehicles && d.supported_vehicles.map(v => v.toLowerCase()).includes(vehicleType.toLowerCase()))
                                    : data;
                                setDrivers(filtered);
                            } catch (apiErr) {
                                console.error("DriversList: Failed to fetch drivers with default location:", apiErr);
                                setError("Failed to load drivers.");
                            }
                            setLoading(false);
                        }
                    );
                } else {
                    console.log("DriversList: geolocation not supported");
                    const data = await getDriversNearby(6.5244, 3.3792);
                    const filtered = vehicleType
                        ? data.filter(d => d.supported_vehicles && d.supported_vehicles.map(v => v.toLowerCase()).includes(vehicleType.toLowerCase()))
                        : data;
                    setDrivers(filtered);
                    setLoading(false);
                }
            } catch (err) {
                console.error("DriversList: Error fetching drivers:", err);
                setError("Failed to load drivers. Please try again.");
                setLoading(false);
            }
        };

        fetchDrivers();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-8">
                <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#C69C2E]/10 flex items-center justify-center">
                        <Car className="w-7 h-7 text-[#C69C2E]" />
                    </div>
                    <div className="absolute -inset-2 rounded-2xl border-2 border-[#C69C2E]/20 animate-ping" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Searching nearby</p>
                <p className="text-xs text-gray-400">Finding the best drivers for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm text-red-500 mb-1 font-semibold">Connection Issue</p>
                <p className="text-xs text-gray-400 mb-4">{error}</p>
                <Button onClick={onBack} variant="outline" className="rounded-xl text-sm">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Drivers Near You</h2>
                        <p className="text-[10px] text-gray-400">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} found</p>
                    </div>
                </div>
                {drivers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                        <Zap className="w-3 h-3 text-green-600" />
                        <span className="text-[10px] text-green-700 font-medium">Average match time: ~28 seconds</span>
                    </div>
                )}
            </div>

            {/* Drivers List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                {drivers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <Car className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No drivers nearby</p>
                        <p className="text-xs text-gray-400 mt-1">Try again in a moment</p>
                    </div>
                ) : (
                    drivers.map((driver) => {
                        const isSelected = selectedDriver === driver.driver_id;
                        const arrivalMin = Math.ceil(driver.distance_km * 2);
                        const baseFare = 2000;
                        const distanceFare = Math.ceil(tripDistance * 500);
                        const subTotal = baseFare + distanceFare;
                        const serviceFee = Math.ceil(subTotal * 0.1);
                        const estimatedPrice = subTotal + serviceFee;
                        const rating = (driver.rating ?? 5.0).toFixed(1);

                        return (
                            <div
                                key={driver.driver_id}
                                onClick={() => setSelectedDriver(driver.driver_id)}
                                className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isSelected
                                        ? 'bg-[#C69C2E]/5 border-2 border-[#C69C2E]/30 shadow-sm'
                                        : 'bg-white border border-gray-100 hover:border-[#C69C2E]/20 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Driver Avatar */}
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDriverProfile(driver.driver_id);
                                        }}
                                        title="View Profile"
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer overflow-hidden hover:bg-gray-100 mt-0.5 ${
                                            isSelected ? 'bg-[#C69C2E]/15 ring-2 ring-[#C69C2E]/20' : 'bg-gray-50'
                                        }`}
                                    >
                                        {driver.driver_avatar ? (
                                            <img
                                                src={driver.driver_avatar}
                                                alt={driver.driver_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Car className={`w-5 h-5 ${isSelected ? 'text-[#C69C2E]' : 'text-gray-400'}`} />
                                        )}
                                    </div>

                                    {/* Info & Price Grid */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        {/* Top Row: Driver Name & Rating + Price */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <h3 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewDriverProfile(driver.driver_id);
                                                    }}
                                                    title="View Profile"
                                                    className="text-sm font-bold text-gray-900 truncate hover:text-[#C69C2E] hover:underline cursor-pointer"
                                                >
                                                    {driver.driver_name}
                                                </h3>
                                                <div className="flex items-center gap-0.5 flex-shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/60">
                                                    <Star className="w-3 h-3 text-[#C69C2E] fill-[#C69C2E]" />
                                                    <span className="text-[10px] font-bold text-amber-900">{rating}</span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-900 leading-tight">₦{estimatedPrice.toLocaleString()}</p>
                                                <p className="text-[9px] text-gray-400">est. fare</p>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Stats & Specs (Wrapped for mobile) */}
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap pt-0.5">
                                            <span className="font-semibold text-gray-700">{driver.car_name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                                {driver.distance_km.toFixed(1)} km
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5 text-gray-400" />
                                                {arrivalMin} min
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-1 py-0.2 rounded">
                                                <Shield className="w-2.5 h-2.5 text-emerald-500" />
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="px-4 py-4 border-t border-gray-50 bg-white">
                <Button
                    onClick={() => {
                        const driver = drivers.find(d => d.driver_id === selectedDriver);
                        if (driver) onContinue(driver);
                    }}
                    className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#C69C2E]/20 group"
                    disabled={!selectedDriver && drivers.length > 0}
                >
                    {selectedDriver ? 'Continue with Driver' : 'Select a Driver'}
                    <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
    );
}
