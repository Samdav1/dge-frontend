"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapWrapper = dynamic(() => import("./MapWrapper"), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-100 dark:bg-[#141414] h-full w-full flex flex-col items-center justify-center p-6 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading Map Navigation...</p>
        </div>
    ),
});

export function MapView({ 
    center, 
    liveDrivers = [],
    trip = null,
    driverLocation = null,
    onSelectDriver,
}: { 
    center?: [number, number] | null; 
    liveDrivers?: { id: string; lat: number; lng: number; supported_vehicles?: string[]; details?: any }[];
    trip?: any | null;
    driverLocation?: { lat: number; lng: number } | null;
    onSelectDriver?: (driver: any) => void;
}) {
    return (
        <div className="bg-gray-100 dark:bg-[#141414] rounded-3xl overflow-hidden h-full min-h-[350px] sm:min-h-[440px] md:min-h-[500px] relative z-0 border border-gray-200/70 dark:border-[#2A2A2A] shadow-sm">
            <MapWrapper 
                center={center} 
                liveDrivers={liveDrivers} 
                trip={trip}
                driverLocation={driverLocation}
                onSelectDriver={onSelectDriver}
            />
        </div>
    );
}
