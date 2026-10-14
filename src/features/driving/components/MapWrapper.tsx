"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle, RefreshCw, Navigation, MapPin } from "lucide-react";

// Google Maps SVG Marker Icons
const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <filter id="cShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="100%" stop-color="#3A3A3A"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="21" fill="url(#carGrad)" stroke="#C69C2E" stroke-width="2.5" filter="url(#cShadow)"/>
  <circle cx="24" cy="24" r="23" fill="none" stroke="#C69C2E" stroke-width="1" stroke-opacity="0.35"/>
  <g transform="translate(12, 12)">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" fill="none" stroke="#C69C2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="6.5" cy="16.5" r="2.5" fill="none" stroke="#C69C2E" stroke-width="2"/>
    <circle cx="16.5" cy="16.5" r="2.5" fill="none" stroke="#C69C2E" stroke-width="2"/>
  </g>
</svg>`;

const PICKUP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
  <defs>
    <filter id="pShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M19 0C8.5 0 0 8.5 0 19c0 14 19 27 19 27s19-13 19-27C38 8.5 29.5 0 19 0z" fill="#C69C2E" filter="url(#pShadow)"/>
  <circle cx="19" cy="19" r="13" fill="#FFFFFF"/>
  <circle cx="19" cy="19" r="6" fill="#1A1A1A"/>
</svg>`;

const DROPOFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
  <defs>
    <filter id="dShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M19 0C8.5 0 0 8.5 0 19c0 14 19 27 19 27s19-13 19-27C38 8.5 29.5 0 19 0z" fill="#E11D48" filter="url(#dShadow)"/>
  <circle cx="19" cy="19" r="13" fill="#FFFFFF"/>
  <rect x="13.5" y="13.5" width="11" height="11" rx="2" fill="#E11D48"/>
</svg>`;

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
  <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#3B82F6"/>
  <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
</svg>`;

// Modern Sleek Dark Mode Styling
const darkMapStyles: any[] = [
    { elementType: "geometry", stylers: [{ color: "#1F1F1F" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8E8E93" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1F1F1F" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#48484A" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#282828" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2C2C2E" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#242426" }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#3A3A3C" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#252525" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B0B0C" }] }
];

// Clean Modern Light Mode Styling
const lightMapStyles: any[] = [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#e4e8ec" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2e6ea" }, { weight: 0.8 }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d0d7de" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f1f3f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#495057" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] }
];

// Mock route coordinates (pickup to destination demo)
const fallbackRouteCoordinates = [
    { lat: 6.222, lng: 7.082 },
    { lat: 6.223, lng: 7.083 },
    { lat: 6.224, lng: 7.084 },
    { lat: 6.225, lng: 7.085 },
    { lat: 6.226, lng: 7.086 },
    { lat: 6.227, lng: 7.087 },
];

interface MapWrapperProps {
    center?: [number, number] | null;
    liveDrivers?: { id: string; lat: number; lng: number; details?: any }[];
    trip?: any | null;
    driverLocation?: { lat: number; lng: number } | null;
}

export default function MapWrapper({ center, liveDrivers = [], trip, driverLocation }: MapWrapperProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const activeInfoWindowRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);
    const directionsRendererRef = useRef<any>(null);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Load Google Maps JavaScript API
    const loadGoogleMaps = useCallback(() => {
        if (typeof window === "undefined") return;

        if ((window as any).google?.maps) {
            setIsScriptLoaded(true);
            setLoadError(false);
            return;
        }

        const existingScript = document.getElementById("google-maps-js-sdk");
        if (existingScript) {
            existingScript.addEventListener("load", () => setIsScriptLoaded(true));
            existingScript.addEventListener("error", () => setLoadError(true));
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        const script = document.createElement("script");
        script.id = "google-maps-js-sdk";
        script.async = true;
        script.defer = true;
        script.src = apiKey
            ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
            : `https://maps.googleapis.com/maps/api/js?libraries=places,geometry`;

        script.onload = () => {
            setIsScriptLoaded(true);
            setLoadError(false);
        };
        script.onerror = () => {
            console.error("Google Maps SDK failed to load");
            setLoadError(true);
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        loadGoogleMaps();
    }, [loadGoogleMaps]);

    // Check dark mode
    const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    // Initialize Google Map instance
    useEffect(() => {
        if (!isScriptLoaded || !mapContainerRef.current) return;
        const google = (window as any).google;
        if (!google?.maps) return;

        if (!mapInstanceRef.current) {
            const initialCenter = trip
                ? { lat: trip.pickup_lat, lng: trip.pickup_lng }
                : center
                ? { lat: center[0], lng: center[1] }
                : { lat: 6.224, lng: 7.084 };

            const map = new google.maps.Map(mapContainerRef.current, {
                center: initialCenter,
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
                styles: isDarkMode ? darkMapStyles : lightMapStyles,
            });

            directionsRendererRef.current = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: "#C69C2E",
                    strokeWeight: 5,
                    strokeOpacity: 0.9,
                },
            });

            mapInstanceRef.current = map;
        }
    }, [isScriptLoaded, isDarkMode, trip, center]);

    // Render / update markers, route, and bounds
    useEffect(() => {
        if (!isScriptLoaded || !mapInstanceRef.current) return;
        const google = (window as any).google;
        if (!google?.maps) return;

        const map = mapInstanceRef.current;

        // Clear existing markers
        Object.values(markersRef.current).forEach((marker: any) => marker.setMap(null));
        markersRef.current = {};

        // Helper to create marker
        const createMarker = (
            key: string,
            position: { lat: number; lng: number },
            svgString: string,
            size: [number, number],
            anchor: [number, number],
            infoContent?: string
        ) => {
            const icon = {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
                scaledSize: new google.maps.Size(size[0], size[1]),
                anchor: new google.maps.Point(anchor[0], anchor[1]),
            };

            const marker = new google.maps.Marker({
                position,
                map,
                icon,
                title: key,
            });

            if (infoContent) {
                const infoWindow = new google.maps.InfoWindow({
                    content: `<div style="padding: 6px 10px; font-family: sans-serif; font-size: 13px; color: #111;">${infoContent}</div>`,
                });
                marker.addListener("click", () => {
                    if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
                    infoWindow.open(map, marker);
                    activeInfoWindowRef.current = infoWindow;
                });
            }

            markersRef.current[key] = marker;
            return marker;
        };

        const bounds = new google.maps.LatLngBounds();

        // 1. Pickup Marker
        if (trip) {
            const pickupPos = { lat: trip.pickup_lat, lng: trip.pickup_lng };
            createMarker(
                "pickup",
                pickupPos,
                PICKUP_SVG,
                [38, 46],
                [19, 46],
                `<strong>Pickup Location</strong><br/><span style="color:#666;">${trip.pickup_address || "Pickup"}</span>`
            );
            bounds.extend(pickupPos);
        } else {
            createMarker(
                "pickup-default",
                { lat: 6.222, lng: 7.082 },
                PICKUP_SVG,
                [38, 46],
                [19, 46],
                `<strong>Pickup Location</strong><br/><span style="color:#666;">Ifite-awka, Anambra State</span>`
            );
        }

        // 2. Dropoff Marker
        if (trip) {
            const dropoffPos = { lat: trip.dropoff_lat, lng: trip.dropoff_lng };
            createMarker(
                "dropoff",
                dropoffPos,
                DROPOFF_SVG,
                [38, 46],
                [19, 46],
                `<strong>Destination</strong><br/><span style="color:#666;">${trip.dropoff_address || "Dropoff"}</span>`
            );
            bounds.extend(dropoffPos);
        } else {
            createMarker(
                "dropoff-default",
                { lat: 6.227, lng: 7.087 },
                DROPOFF_SVG,
                [38, 46],
                [19, 46],
                `<strong>Destination</strong><br/><span style="color:#666;">Nnewi, Anambra State</span>`
            );
        }

        // 3. Active Trip Driver Marker
        const currentDriverPos = driverLocation
            ? { lat: driverLocation.lat, lng: driverLocation.lng }
            : trip && trip.status === "ACTIVE"
            ? { lat: trip.pickup_lat, lng: trip.pickup_lng }
            : null;

        if (currentDriverPos) {
            createMarker(
                "active-driver",
                currentDriverPos,
                CAR_SVG,
                [46, 46],
                [23, 23],
                `<strong>Your Ride</strong><br/><span style="color:#C69C2E; font-weight: 600;">En route to destination</span>`
            );
            bounds.extend(currentDriverPos);
        }

        // 4. Center Marker (if user selected a specific location and not on trip)
        if (center && !trip) {
            const centerPos = { lat: center[0], lng: center[1] };
            createMarker(
                "selected-center",
                centerPos,
                PIN_SVG,
                [32, 40],
                [16, 40],
                `<strong>Selected Location</strong>`
            );
            map.panTo(centerPos);
        }

        // 5. Live Drivers (when NOT in active trip)
        if (!trip) {
            if (liveDrivers.length > 0) {
                liveDrivers.forEach((driver) => {
                    const pos = { lat: driver.lat, lng: driver.lng };
                    const carInfo = driver.details
                        ? `${driver.details.car_name || ""} ${driver.details.car_model || ""}`
                        : "Available Ride";
                    const rating = driver.details?.rating ? `★ ${driver.details.rating}` : "ID: " + driver.id.slice(0, 8);

                    createMarker(
                        `driver-${driver.id}`,
                        pos,
                        CAR_SVG,
                        [44, 44],
                        [22, 22],
                        `<strong>${driver.details?.name || "Live Driver"}</strong><br/><span style="color:#666;">${carInfo}</span><br/><span style="color:#C69C2E; font-weight:600;">${rating}</span>`
                    );
                });
            } else {
                // Fallback demo drivers
                const fallbackDrivers = [
                    { lat: 6.225, lng: 7.085, name: "David Johnson", car: "Toyota Corolla • ABJ-432KD", time: "4 mins away" },
                    { lat: 6.220, lng: 7.080, name: "Sophia Turner", car: "Honda Civic • ABJ-298LM", time: "6 mins away" },
                    { lat: 6.230, lng: 7.090, name: "Michael Lee", car: "Ford Focus • ABJ-156NK", time: "8 mins away" },
                ];
                fallbackDrivers.forEach((d, idx) => {
                    createMarker(
                        `fallback-${idx}`,
                        { lat: d.lat, lng: d.lng },
                        CAR_SVG,
                        [44, 44],
                        [22, 22],
                        `<strong>${d.name}</strong><br/><span style="color:#666;">${d.car}</span><br/><span style="color:#C69C2E; font-weight:600;">${d.time}</span>`
                    );
                });
            }
        }

        // 6. Draw Route (Directions or Polyline)
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }

        if (trip) {
            // Attempt real turn-by-turn routing via Google Maps DirectionsService
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: { lat: trip.pickup_lat, lng: trip.pickup_lng },
                    destination: { lat: trip.dropoff_lat, lng: trip.dropoff_lng },
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        directionsRendererRef.current?.setDirections(result);
                    } else {
                        // Fallback straight-line polyline if Directions API unavailable
                        const directPath = [
                            { lat: trip.pickup_lat, lng: trip.pickup_lng },
                            { lat: trip.dropoff_lat, lng: trip.dropoff_lng },
                        ];
                        polylineRef.current = new google.maps.Polyline({
                            path: directPath,
                            geodesic: true,
                            strokeColor: "#C69C2E",
                            strokeOpacity: 0.85,
                            strokeWeight: 4,
                            map,
                        });
                    }
                }
            );

            // Fit bounds to trip
            map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        } else {
            // Fallback demo polyline
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections({ routes: [] });
            }
            polylineRef.current = new google.maps.Polyline({
                path: fallbackRouteCoordinates,
                geodesic: true,
                strokeColor: "#C69C2E",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map,
            });
        }
    }, [isScriptLoaded, trip, driverLocation, liveDrivers, center]);

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#141414] p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Google Maps Connection Error</h4>
                <p className="text-xs text-gray-500 max-w-sm">
                    Unable to load Google Maps navigation services. Please check your internet connection.
                </p>
                <button
                    onClick={loadGoogleMaps}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C69C2E] hover:bg-[#b08b29] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Map Connection</span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[300px] md:min-h-[500px]">
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden" />

            {/* Loading Indicator */}
            {!isScriptLoaded && (
                <div className="absolute inset-0 bg-gray-50/90 dark:bg-[#121212]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Initializing Google Maps Navigation...
                    </p>
                </div>
            )}

            {/* Google Maps Live Badge */}
            <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-[#333] shadow-md flex items-center gap-2 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-[#C69C2E]" />
                    Google Maps Live
                </span>
            </div>
        </div>
    );
}
