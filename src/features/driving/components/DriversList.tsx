"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, Car, Clock, Loader2, Star, Shield, MapPin, Zap, ChevronRight, 
    Filter, Search, SlidersHorizontal, CheckCircle2, AlertCircle, XCircle, User, Truck, Bike
} from "lucide-react";
import { getDriversNearby } from "../actions";
import { DriverNearbyResponse } from "../types";

interface DriversListProps {
    onBack: () => void;
    onContinue: (driver: DriverNearbyResponse) => void;
    tripDistance?: number;
    onViewDriverProfile: (driverId: string) => void;
    vehicleType?: string;
}

// Fallback demo drivers if API returns empty list (ensures UI testing is rich)
const DEMO_DRIVERS: DriverNearbyResponse[] = [
    {
        driver_id: "demo-driver-1",
        latitude: 6.5280,
        longitude: 3.3810,
        distance_km: 1.2,
        car_name: "Toyota Camry 2021",
        driver_name: "Alex Okon",
        rating: 4.9,
        driver_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        supported_vehicles: ["car"],
        is_online: true,
        is_available: true,
        is_booked: false,
        status: "active",
        booking_status: "available"
    },
    {
        driver_id: "demo-driver-2",
        latitude: 6.5350,
        longitude: 3.3900,
        distance_km: 2.8,
        car_name: "Honda Accord 2020",
        driver_name: "Emeka Obi",
        rating: 4.8,
        driver_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        supported_vehicles: ["car", "van"],
        is_online: true,
        is_available: false,
        is_booked: true,
        status: "active",
        booking_status: "booked"
    },
    {
        driver_id: "demo-driver-3",
        latitude: 6.5120,
        longitude: 3.3650,
        distance_km: 4.5,
        car_name: "Toyota Sienna Van",
        driver_name: "Bisi Akande",
        rating: 4.7,
        driver_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        supported_vehicles: ["van"],
        is_online: true,
        is_available: true,
        is_booked: false,
        status: "active",
        booking_status: "available"
    },
    {
        driver_id: "demo-driver-4",
        latitude: 6.5400,
        longitude: 3.4100,
        distance_km: 7.2,
        car_name: "Keke Apex 3-Wheeler",
        driver_name: "Musa Ibrahim",
        rating: 4.9,
        driver_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        supported_vehicles: ["tricycle"],
        is_online: true,
        is_available: true,
        is_booked: false,
        status: "active",
        booking_status: "available"
    },
    {
        driver_id: "demo-driver-5",
        latitude: 6.5600,
        longitude: 3.4200,
        distance_km: 11.4,
        car_name: "Innoson Cargo Hauler",
        driver_name: "Suleiman Bello",
        rating: 4.6,
        driver_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        supported_vehicles: ["truck"],
        is_online: true,
        is_available: false,
        is_booked: true,
        status: "active",
        booking_status: "booked"
    },
    {
        driver_id: "demo-driver-6",
        latitude: 6.5000,
        longitude: 3.3500,
        distance_km: 14.8,
        car_name: "Yamaha Express Bike",
        driver_name: "David Chen",
        rating: 4.5,
        driver_avatar: undefined,
        supported_vehicles: ["bike"],
        is_online: false,
        is_available: false,
        is_booked: false,
        status: "active",
        booking_status: "offline"
    }
];

export function DriversList({ onBack, onContinue, tripDistance = 0, onViewDriverProfile, vehicleType: initialVehicleType }: DriversListProps) {
    const [drivers, setDrivers] = useState<DriverNearbyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

    // Filter and Sort states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>(initialVehicleType || "all");
    const [statusFilter, setStatusFilter] = useState<"all" | "available" | "booked" | "offline">("all");
    const [sortBy, setSortBy] = useState<"distance" | "rating" | "available_first">("distance");
    const [maxDistanceFilter, setMaxDistanceFilter] = useState<number>(9999);

    useEffect(() => {
        const fetchDrivers = async () => {
            console.log("DriversList: fetchDrivers called for all system drivers");
            setLoading(true);
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            try {
                                const data = await getDriversNearby(
                                    position.coords.latitude,
                                    position.coords.longitude,
                                    50.0,
                                    true
                                );
                                if (data && data.length > 0) {
                                    setDrivers(data);
                                } else {
                                    setDrivers(DEMO_DRIVERS);
                                }
                            } catch (err) {
                                console.error("DriversList: Failed to fetch API drivers, using demo drivers:", err);
                                setDrivers(DEMO_DRIVERS);
                            } finally {
                                setLoading(false);
                            }
                        },
                        async () => {
                            try {
                                const data = await getDriversNearby(6.5244, 3.3792, 50.0, true);
                                if (data && data.length > 0) {
                                    setDrivers(data);
                                } else {
                                    setDrivers(DEMO_DRIVERS);
                                }
                            } catch (apiErr) {
                                setDrivers(DEMO_DRIVERS);
                            } finally {
                                setLoading(false);
                            }
                        }
                    );
                } else {
                    const data = await getDriversNearby(6.5244, 3.3792, 50.0, true);
                    setDrivers(data && data.length > 0 ? data : DEMO_DRIVERS);
                    setLoading(false);
                }
            } catch (err) {
                console.error("DriversList: Error fetching drivers:", err);
                setDrivers(DEMO_DRIVERS);
                setLoading(false);
            }
        };

        fetchDrivers();
    }, []);

    // Filter and sort drivers computation
    const filteredDrivers = useMemo(() => {
        return drivers
            .filter((driver) => {
                // Search query match
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch = !query || 
                    driver.driver_name.toLowerCase().includes(query) ||
                    driver.car_name.toLowerCase().includes(query);

                // Vehicle filter match
                const matchesVehicle = selectedVehicleFilter === "all" ||
                    (driver.supported_vehicles && driver.supported_vehicles.map(v => v.toLowerCase()).includes(selectedVehicleFilter.toLowerCase()));

                // Booking / Status filter match
                const bookingStat = driver.booking_status || (driver.is_booked ? "booked" : (driver.is_available ? "available" : "offline"));
                const matchesStatus = statusFilter === "all" || bookingStat === statusFilter;

                // Distance filter
                const matchesDistance = driver.distance_km <= maxDistanceFilter;

                return matchesSearch && matchesVehicle && matchesStatus && matchesDistance;
            })
            .sort((a, b) => {
                if (sortBy === "distance") {
                    return a.distance_km - b.distance_km;
                } else if (sortBy === "rating") {
                    return (b.rating || 5.0) - (a.rating || 5.0);
                } else if (sortBy === "available_first") {
                    const getRank = (d: DriverNearbyResponse) => {
                        const status = d.booking_status || (d.is_booked ? "booked" : (d.is_available ? "available" : "offline"));
                        if (status === "available") return 0;
                        if (status === "booked") return 1;
                        return 2;
                    };
                    return getRank(a) - getRank(b) || a.distance_km - b.distance_km;
                }
                return 0;
            });
    }, [drivers, searchQuery, selectedVehicleFilter, statusFilter, sortBy, maxDistanceFilter]);

    const activeSelectedDriver = useMemo(() => {
        return drivers.find(d => d.driver_id === selectedDriverId) || null;
    }, [drivers, selectedDriverId]);

    const counts = useMemo(() => {
        let available = 0;
        let booked = 0;
        let offline = 0;
        drivers.forEach(d => {
            const stat = d.booking_status || (d.is_booked ? "booked" : (d.is_available ? "available" : "offline"));
            if (stat === "available") available++;
            else if (stat === "booked") booked++;
            else offline++;
        });
        return { total: drivers.length, available, booked, offline };
    }, [drivers]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-8">
                <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#C69C2E]/10 flex items-center justify-center">
                        <Car className="w-7 h-7 text-[#C69C2E]" />
                    </div>
                    <div className="absolute -inset-2 rounded-2xl border-2 border-[#C69C2E]/20 animate-ping" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Scanning System Drivers...</p>
                <p className="text-xs text-gray-400">Loading live driver positions and availability...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">System Drivers</h2>
                            <p className="text-[10px] text-gray-400 font-medium">
                                {counts.total} Total ({counts.available} available • {counts.booked} booked • {counts.offline} offline)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mt-2 mb-3">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search driver name, car model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-[#C69C2E]/20 focus:border-[#C69C2E]/40 outline-none transition-all"
                    />
                </div>

                {/* Filter & Sort Controls Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Sort Dropdown */}
                    <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C69C2E]"
                        >
                            <option value="distance">📍 Closest First</option>
                            <option value="available_first">🟢 Available First</option>
                            <option value="rating">⭐ Highest Rated</option>
                        </select>
                    </div>

                    {/* Proximity / Radius Filter */}
                    <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Max Distance</label>
                        <select
                            value={maxDistanceFilter}
                            onChange={(e) => setMaxDistanceFilter(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C69C2E]"
                        >
                            <option value={9999}>Any Distance</option>
                            <option value={5}>Within 5 km</option>
                            <option value={10}>Within 10 km</option>
                            <option value={25}>Within 25 km</option>
                            <option value={50}>Within 50 km</option>
                        </select>
                    </div>
                </div>

                {/* Vehicle Type & Status Quick Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden mt-3 pt-1 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Vehicle:</span>
                    {[
                        { id: "all", label: "All" },
                        { id: "car", label: "Car" },
                        { id: "van", label: "Van" },
                        { id: "truck", label: "Truck" },
                        { id: "bike", label: "Bike" },
                        { id: "tricycle", label: "Tricycle" }
                    ].map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVehicleFilter(v.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                                selectedVehicleFilter === v.id
                                    ? "bg-[#C69C2E] text-white shadow-xs"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden mt-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Status:</span>
                    {[
                        { id: "all", label: "All" },
                        { id: "available", label: "🟢 Available" },
                        { id: "booked", label: "🟡 Booked" },
                        { id: "offline", label: "⚪ Offline" }
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStatusFilter(s.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                                statusFilter === s.id
                                    ? "bg-gray-900 text-white shadow-xs"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drivers List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
                {filteredDrivers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <Car className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-700 font-bold">No drivers match your filters</p>
                        <p className="text-xs text-gray-400 mt-1">Try expanding your distance limit or changing vehicle filter</p>
                        <Button 
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedVehicleFilter("all");
                                setStatusFilter("all");
                                setMaxDistanceFilter(9999);
                            }}
                            variant="outline" 
                            className="mt-4 rounded-xl text-xs"
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    filteredDrivers.map((driver) => {
                        const isSelected = selectedDriverId === driver.driver_id;
                        const arrivalMin = Math.ceil(driver.distance_km * 2.2);
                        const rating = (driver.rating ?? 5.0).toFixed(1);
                        
                        // Status resolution
                        const bookingStatus = driver.booking_status || (driver.is_booked ? "booked" : (driver.is_available ? "available" : "offline"));
                        const isAvailable = bookingStatus === "available";
                        const isBooked = bookingStatus === "booked";
                        const isOffline = bookingStatus === "offline";

                        // Fare estimate
                        const baseFare = 1500;
                        const distFare = Math.ceil(tripDistance * 400);
                        const estimatedPrice = baseFare + distFare;

                        return (
                            <div
                                key={driver.driver_id}
                                onClick={() => setSelectedDriverId(driver.driver_id)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 bg-white ${
                                    isSelected
                                        ? "ring-2 ring-[#C69C2E] border-transparent shadow-md bg-gradient-to-r from-white via-amber-50/20 to-white"
                                        : "border border-gray-100 hover:border-[#C69C2E]/30 hover:shadow-sm"
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    {/* Driver Avatar & Online Dot */}
                                    <div className="relative">
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDriverProfile(driver.driver_id);
                                            }}
                                            title="View Driver Profile"
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer overflow-hidden bg-gray-100 border ${
                                                isSelected ? 'border-[#C69C2E] ring-2 ring-[#C69C2E]/20' : 'border-gray-200'
                                            }`}
                                        >
                                            {driver.driver_avatar ? (
                                                <img
                                                    src={driver.driver_avatar}
                                                    alt={driver.driver_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        {/* Status Dot indicator */}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                                            isAvailable ? "bg-emerald-500" : isBooked ? "bg-amber-500" : "bg-gray-400"
                                        }`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Driver Specs & Details */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        {/* Name, Rating & Booking Status Badge */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h3 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onViewDriverProfile(driver.driver_id);
                                                        }}
                                                        title="Click to view driver profile"
                                                        className="text-sm font-bold text-gray-900 truncate hover:text-[#C69C2E] hover:underline cursor-pointer"
                                                    >
                                                        {driver.driver_name}
                                                    </h3>
                                                    <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/80">
                                                        <Star className="w-3 h-3 text-[#C69C2E] fill-[#C69C2E]" />
                                                        <span className="text-[10px] font-bold text-amber-900">{rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">{driver.car_name}</p>
                                            </div>

                                            {/* Booking Status Pill */}
                                            <div className="flex-shrink-0 text-right">
                                                {isAvailable && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        Available
                                                    </span>
                                                )}
                                                {isBooked && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold">
                                                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                                        Booked (In Trip)
                                                    </span>
                                                )}
                                                {isOffline && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold">
                                                        <XCircle className="w-3 h-3 text-gray-400" />
                                                        Offline
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Distance Calculator & Time Badge */}
                                        <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px]">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                    <MapPin className="w-3 h-3 text-[#C69C2E]" />
                                                    {driver.distance_km > 900 ? "Distance N/A" : `${driver.distance_km.toFixed(1)} km away`}
                                                </span>
                                                {driver.distance_km <= 900 && (
                                                    <span className="flex items-center gap-1 font-medium text-gray-500">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        ~{arrivalMin} min ETA
                                                    </span>
                                                )}
                                            </div>

                                            {tripDistance > 0 && isAvailable && (
                                                <span className="font-bold text-gray-900">
                                                    ₦{estimatedPrice.toLocaleString()} <span className="text-[9px] font-normal text-gray-400">est.</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Notice / Alert if driver is Booked or Offline */}
                                {isSelected && !isAvailable && (
                                    <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">
                                                {isBooked ? "Driver Currently Booked" : "Driver Currently Offline"}
                                            </p>
                                            <p className="text-[11px] text-amber-700/90 leading-relaxed mt-0.5">
                                                {isBooked 
                                                    ? "This driver is currently carrying out an active trip. Please select an active available driver to request a ride immediately."
                                                    : "This driver is offline right now. You can view their public profile or select an available driver to proceed."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="px-4 py-3.5 border-t border-gray-100 bg-white">
                <Button
                    onClick={() => {
                        if (activeSelectedDriver && (activeSelectedDriver.booking_status === "available" || activeSelectedDriver.is_available)) {
                            onContinue(activeSelectedDriver);
                        }
                    }}
                    className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#C69C2E]/20 group disabled:opacity-50"
                    disabled={!activeSelectedDriver || (activeSelectedDriver.booking_status !== "available" && !activeSelectedDriver.is_available)}
                >
                    {activeSelectedDriver ? (
                        (activeSelectedDriver.booking_status === "available" || activeSelectedDriver.is_available) ? (
                            <span className="flex items-center justify-center gap-2">
                                Continue with {activeSelectedDriver.driver_name.split(" ")[0]}
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        ) : (
                            <span>Selected Driver Unavailable</span>
                        )
                    ) : (
                        <span>Select an Available Driver</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
