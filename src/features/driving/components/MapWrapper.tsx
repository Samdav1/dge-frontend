"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
    Loader2, AlertCircle, RefreshCw, Navigation, Crosshair, 
    TrafficCone, ZoomIn, ZoomOut, Star, ShieldCheck, Car, 
    X, ArrowRight, Zap, CheckCircle2, ChevronRight, Fuel
} from "lucide-react";

// Top-Down Vehicle SVGs (inDrive / Mobility App Style)
const SEDAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="60" viewBox="0 0 34 60" fill="none">
  <rect x="0" y="10" width="4" height="10" rx="2" fill="#1C1C1E"/>
  <rect x="30" y="10" width="4" height="10" rx="2" fill="#1C1C1E"/>
  <rect x="0" y="40" width="4" height="10" rx="2" fill="#1C1C1E"/>
  <rect x="30" y="40" width="4" height="10" rx="2" fill="#1C1C1E"/>
  <path d="M4 14C4 6 8 0 17 0C26 0 30 6 30 14V46C30 54 26 60 17 60C8 60 4 54 4 46V14Z" fill="#1E2022" stroke="#C69C2E" stroke-width="1.8"/>
  <path d="M7 16C9 13 13 12 17 12C21 12 25 13 27 16V22H7V16Z" fill="#38BDF8" fill-opacity="0.85"/>
  <rect x="8" y="23" width="18" height="18" rx="3" fill="#141517"/>
  <path d="M8 43H26V45C26 47 22 48 17 48C12 48 8 47 8 45V43Z" fill="#38BDF8" fill-opacity="0.75"/>
  <rect x="6" y="2" width="4" height="3" rx="1.5" fill="#FEF08A"/>
  <rect x="24" y="2" width="4" height="3" rx="1.5" fill="#FEF08A"/>
  <rect x="6" y="57" width="5" height="2" rx="1" fill="#EF4444"/>
  <rect x="23" y="57" width="5" height="2" rx="1" fill="#EF4444"/>
</svg>`;

const COMFORT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="64" viewBox="0 0 36 64" fill="none">
  <rect x="0" y="11" width="4" height="11" rx="2" fill="#0A0A0C"/>
  <rect x="32" y="11" width="4" height="11" rx="2" fill="#0A0A0C"/>
  <rect x="0" y="42" width="4" height="11" rx="2" fill="#0A0A0C"/>
  <rect x="32" y="42" width="4" height="11" rx="2" fill="#0A0A0C"/>
  <path d="M4 15C4 6 9 0 18 0C27 0 32 6 32 15V48C32 57 27 64 18 64C9 64 4 57 4 48V15Z" fill="#121315" stroke="#F59E0B" stroke-width="2.2"/>
  <rect x="9" y="14" width="18" height="32" rx="4" fill="#0EA5E9" fill-opacity="0.85"/>
  <line x1="9" y1="28" x2="27" y2="28" stroke="#F59E0B" stroke-width="1.5"/>
  <rect x="6" y="2" width="5" height="3" rx="1.5" fill="#FFFFFF"/>
  <rect x="25" y="2" width="5" height="3" rx="1.5" fill="#FFFFFF"/>
  <rect x="6" y="60" width="6" height="2.5" rx="1" fill="#DC2626"/>
  <rect x="24" y="60" width="6" height="2.5" rx="1" fill="#DC2626"/>
</svg>`;

const SUV_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="66" viewBox="0 0 38 66" fill="none">
  <rect x="0" y="12" width="5" height="12" rx="2" fill="#09090B"/>
  <rect x="33" y="12" width="5" height="12" rx="2" fill="#09090B"/>
  <rect x="0" y="42" width="5" height="12" rx="2" fill="#09090B"/>
  <rect x="33" y="42" width="5" height="12" rx="2" fill="#09090B"/>
  <path d="M5 14C5 6 10 0 19 0C28 0 33 6 33 14V50C33 59 28 66 19 66C10 66 5 59 5 50V14Z" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
  <rect x="8" y="16" width="2" height="34" rx="1" fill="#94A3B8"/>
  <rect x="28" y="16" width="2" height="34" rx="1" fill="#94A3B8"/>
  <path d="M9 15H29V24H9V15Z" fill="#38BDF8" fill-opacity="0.85"/>
  <rect x="10" y="47" width="18" height="5" rx="2" fill="#38BDF8" fill-opacity="0.75"/>
  <rect x="7" y="2" width="6" height="3" rx="1.5" fill="#FDE047"/>
  <rect x="25" y="2" width="6" height="3" rx="1.5" fill="#FDE047"/>
</svg>`;

const BIKE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="54" viewBox="0 0 24 54" fill="none">
  <rect x="10" y="0" width="4" height="14" rx="2" fill="#111" stroke="#10B981" stroke-width="1.5"/>
  <line x1="2" y1="12" x2="22" y2="12" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
  <circle cx="2" cy="10" r="2" fill="#E2E8F0"/>
  <circle cx="22" cy="10" r="2" fill="#E2E8F0"/>
  <rect x="7" y="14" width="10" height="24" rx="5" fill="#1E293B"/>
  <circle cx="12" cy="22" r="5" fill="#F59E0B" stroke="#111" stroke-width="1.5"/>
  <rect x="10" y="40" width="4" height="14" rx="2" fill="#111" stroke="#10B981" stroke-width="1.5"/>
</svg>`;

const ACTIVE_CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="72" viewBox="0 0 42 72" fill="none">
  <rect x="0" y="13" width="5" height="12" rx="2.5" fill="#000"/>
  <rect x="37" y="13" width="5" height="12" rx="2.5" fill="#000"/>
  <rect x="0" y="47" width="5" height="12" rx="2.5" fill="#000"/>
  <rect x="37" y="47" width="5" height="12" rx="2.5" fill="#000"/>
  <path d="M5 16C5 6 11 0 21 0C31 0 37 6 37 16V54C37 64 31 72 21 72C11 72 5 64 5 54V16Z" fill="#121214" stroke="#C69C2E" stroke-width="3"/>
  <path d="M9 16C12 13 16 12 21 12C26 12 30 13 33 16V26H9V16Z" fill="#FACC15" fill-opacity="0.9"/>
  <rect x="11" y="27" width="20" height="22" rx="4" fill="#1F1F23"/>
  <rect x="16" y="34" width="10" height="4" rx="2" fill="#C69C2E"/>
  <path d="M10 50H32V53C32 56 27 58 21 58C15 58 10 56 10 53V50Z" fill="#FACC15" fill-opacity="0.7"/>
  <rect x="7" y="2" width="6" height="3" rx="1.5" fill="#FFFFFF"/>
  <rect x="29" y="2" width="6" height="3" rx="1.5" fill="#FFFFFF"/>
  <rect x="7" y="68" width="7" height="3" rx="1.5" fill="#EF4444"/>
  <rect x="28" y="68" width="7" height="3" rx="1.5" fill="#EF4444"/>
</svg>`;

const PICKUP_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46" fill="none">
  <path d="M19 0C8.5 0 0 8.5 0 19C0 33 19 46 19 46C19 46 38 33 38 19C38 8.5 29.5 0 19 0Z" fill="#C69C2E"/>
  <circle cx="19" cy="19" r="13" fill="#FFFFFF"/>
  <circle cx="19" cy="19" r="6" fill="#1A1A1A"/>
</svg>`;

const DROPOFF_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46" fill="none">
  <path d="M19 0C8.5 0 0 8.5 0 19C0 33 19 46 19 46C19 46 38 33 38 19C38 8.5 29.5 0 19 0Z" fill="#E11D48"/>
  <circle cx="19" cy="19" r="13" fill="#FFFFFF"/>
  <rect x="13.5" y="13.5" width="11" height="11" rx="2" fill="#E11D48"/>
</svg>`;

// Modern Sleek Dark Mode Styling
const darkMapStyles: any[] = [
    { elementType: "geometry", stylers: [{ color: "#1B1C1E" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8E8E93" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1B1C1E" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3A3B3E" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#252629" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2C2D30" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#222326" }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#3C3D42" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#232427" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B0C0E" }] }
];

// Clean Modern Light Mode Styling
const lightMapStyles: any[] = [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbe4eb" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2e8f0" }, { weight: 0.8 }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#cbd5e1" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] }
];

// Demo Available Drivers with Realistic inDrive Attributes
const fallbackDemoDrivers = [
    {
        id: "demo-1",
        lat: 6.2255,
        lng: 7.0852,
        driver_name: "David Johnson",
        car_name: "Toyota Corolla",
        car_type: "Sedan",
        rating: 4.9,
        eta_min: 3,
        fare: 1800,
        trips: 342,
        vehicle_category: "sedan"
    },
    {
        id: "demo-2",
        lat: 6.2198,
        lng: 7.0815,
        driver_name: "Sophia Turner",
        car_name: "Lexus ES 350",
        car_type: "Comfort",
        rating: 5.0,
        eta_min: 5,
        fare: 2800,
        trips: 512,
        vehicle_category: "comfort"
    },
    {
        id: "demo-3",
        lat: 6.2295,
        lng: 7.0890,
        driver_name: "Michael Lee",
        car_name: "Toyota RAV4",
        car_type: "SUV",
        rating: 4.8,
        eta_min: 4,
        fare: 2400,
        trips: 189,
        vehicle_category: "suv"
    },
    {
        id: "demo-4",
        lat: 6.2230,
        lng: 7.0790,
        driver_name: "Emeka Okafor",
        car_name: "Yamaha Express",
        car_type: "Bike",
        rating: 4.9,
        eta_min: 2,
        fare: 900,
        trips: 640,
        vehicle_category: "bike"
    },
    {
        id: "demo-5",
        lat: 6.2272,
        lng: 7.0834,
        driver_name: "Chinedu Eze",
        car_name: "Hyundai Elantra",
        car_type: "Sedan",
        rating: 4.7,
        eta_min: 6,
        fare: 1600,
        trips: 220,
        vehicle_category: "sedan"
    }
];

interface MapWrapperProps {
    center?: [number, number] | null;
    liveDrivers?: { id: string; lat: number; lng: number; supported_vehicles?: string[]; details?: any }[];
    trip?: any | null;
    driverLocation?: { lat: number; lng: number } | null;
    onSelectDriver?: (driver: any) => void;
}

export default function MapWrapper({ 
    center, 
    liveDrivers = [], 
    trip, 
    driverLocation,
    onSelectDriver 
}: MapWrapperProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const overlaysRef = useRef<any[]>([]);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);
    const directionsRendererRef = useRef<any>(null);
    const trafficLayerRef = useRef<any>(null);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [trafficEnabled, setTrafficEnabled] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<"all" | "sedan" | "comfort" | "suv" | "bike">("all");
    const [selectedDriverPopup, setSelectedDriverPopup] = useState<any | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Load Google Maps SDK
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

    // Initialize Map
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
                fullscreenControl: false,
                zoomControl: false, // We supply custom responsive inDrive controls
                gestureHandling: "greedy", // Smooth single-finger mobile panning
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

            trafficLayerRef.current = new google.maps.TrafficLayer();

            mapInstanceRef.current = map;
        }
    }, [isScriptLoaded, isDarkMode, trip, center]);

    // Helper: Determine vehicle category
    const detectVehicleCategory = (nameOrModel: string, supportedVehicles: string[] = []): "sedan" | "comfort" | "suv" | "bike" => {
        const text = `${nameOrModel || ""} ${supportedVehicles.join(" ")}`.toLowerCase();
        if (text.includes("bike") || text.includes("moto") || text.includes("motorcycle")) return "bike";
        if (text.includes("suv") || text.includes("rav4") || text.includes("highlander") || text.includes("jeep") || text.includes("prado")) return "suv";
        if (text.includes("comfort") || text.includes("lexus") || text.includes("camry") || text.includes("mercedes") || text.includes("bmw")) return "comfort";
        return "sedan";
    };

    // Helper: Pick SVG by category
    const getVehicleSvg = (category: string) => {
        switch (category) {
            case "comfort": return COMFORT_SVG;
            case "suv": return SUV_SVG;
            case "bike": return BIKE_SVG;
            default: return SEDAN_SVG;
        }
    };

    // Format Available Drivers
    const parsedDrivers = useMemo(() => {
        if (liveDrivers.length > 0) {
            return liveDrivers.map((d, index) => {
                const carName = d.details?.car_name || "Toyota Corolla";
                const carModel = d.details?.car_model || "";
                const fullName = `${carName} ${carModel}`.trim();
                const category = detectVehicleCategory(fullName, d.supported_vehicles);
                return {
                    id: d.id || `live-${index}`,
                    lat: d.lat,
                    lng: d.lng,
                    driver_name: d.details?.name || "Verified Driver",
                    car_name: fullName,
                    car_type: category.charAt(0).toUpperCase() + category.slice(1),
                    rating: d.details?.rating || 4.9,
                    eta_min: Math.floor(Math.random() * 4) + 2,
                    fare: 1500 + Math.floor(Math.random() * 800),
                    trips: d.details?.total_rides || 140,
                    vehicle_category: category,
                    raw: d
                };
            });
        }
        return fallbackDemoDrivers;
    }, [liveDrivers]);

    // Filter drivers based on user category selection
    const filteredDrivers = useMemo(() => {
        if (selectedCategory === "all") return parsedDrivers;
        return parsedDrivers.filter(d => d.vehicle_category === selectedCategory);
    }, [parsedDrivers, selectedCategory]);

    // Clean up overlays and markers
    const clearMapItems = () => {
        overlaysRef.current.forEach(ov => ov.setMap(null));
        overlaysRef.current = [];
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
    };

    // Render inDrive Custom HTML Overlays & Route
    useEffect(() => {
        if (!isScriptLoaded || !mapInstanceRef.current) return;
        const google = (window as any).google;
        if (!google?.maps?.OverlayView) return;

        const map = mapInstanceRef.current;
        clearMapItems();

        // Custom inDrive HTML Overlay Class
        class InDriveVehicleOverlay extends google.maps.OverlayView {
            private position: any;
            private div: HTMLElement | null = null;
            private htmlContent: string;
            private clickHandler?: () => void;

            constructor(position: { lat: number; lng: number }, htmlContent: string, clickHandler?: () => void) {
                super();
                this.position = new google.maps.LatLng(position.lat, position.lng);
                this.htmlContent = htmlContent;
                this.clickHandler = clickHandler;
            }

            onAdd() {
                this.div = document.createElement("div");
                this.div.style.position = "absolute";
                this.div.style.cursor = "pointer";
                this.div.style.zIndex = "10";
                this.div.style.transform = "translate(-50%, -50%)";
                this.div.innerHTML = this.htmlContent;

                if (this.clickHandler) {
                    this.div.addEventListener("click", (e) => {
                        e.stopPropagation();
                        this.clickHandler!();
                    });
                }

                const panes = this.getPanes();
                panes?.overlayMouseTarget.appendChild(this.div);
            }

            draw() {
                const projection = this.getProjection();
                if (!projection || !this.div) return;
                const point = projection.fromLatLngToDivPixel(this.position);
                if (point) {
                    this.div.style.left = `${point.x}px`;
                    this.div.style.top = `${point.y}px`;
                }
            }

            onRemove() {
                if (this.div?.parentNode) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                }
            }
        }

        const bounds = new google.maps.LatLngBounds();

        // 1. ACTIVE USER CAR (When trip is ongoing)
        const isTripActive = trip && (
            trip.status === "ACTIVE" || trip.status === "active" || 
            trip.status === "in_progress" || trip.status === "en_route" ||
            trip.status === "arrived"
        );

        const currentActivePos = driverLocation
            ? { lat: driverLocation.lat, lng: driverLocation.lng }
            : isTripActive
            ? { lat: trip.pickup_lat, lng: trip.pickup_lng }
            : null;

        if (currentActivePos) {
            const activeCarHtml = `
                <div class="indrive-active-car-group">
                    <div class="active-pulse-ring"></div>
                    <div class="active-pulse-inner"></div>
                    
                    <div class="indrive-active-pill">
                        <span class="active-live-dot"></span>
                        <div class="active-text-block">
                            <span class="active-pill-title">YOUR RIDE • EN ROUTE</span>
                            <span class="active-pill-sub">${trip.car_name || "Toyota Corolla"} • Driver on the way</span>
                        </div>
                    </div>

                    <div class="active-car-graphic-wrap">
                        ${ACTIVE_CAR_SVG}
                    </div>
                </div>
            `;

            const activeOverlay = new InDriveVehicleOverlay(currentActivePos, activeCarHtml, () => {
                setSelectedDriverPopup({
                    driver_name: trip.driver_name || "Your Assigned Driver",
                    car_name: trip.car_name || "En Route Vehicle",
                    car_type: "Active Ride",
                    rating: 5.0,
                    eta_min: 2,
                    fare: trip.final_fare || trip.negotiated_fare || trip.estimated_fare || 2000,
                    trips: 450,
                    vehicle_category: "active"
                });
            });
            activeOverlay.setMap(map);
            overlaysRef.current.push(activeOverlay);
            bounds.extend(currentActivePos);
        }

        // 2. AVAILABLE DRIVERS ON THE MAP (inDrive style with floating vehicle tags)
        if (!isTripActive) {
            filteredDrivers.forEach((driver) => {
                const pos = { lat: driver.lat, lng: driver.lng };
                const vehicleSvg = getVehicleSvg(driver.vehicle_category);

                const categoryBadgeColors = {
                    sedan: "bg-gray-900 text-white dark:bg-white dark:text-black border-gray-700",
                    comfort: "bg-[#C69C2E] text-white border-[#b08b29]",
                    suv: "bg-blue-600 text-white border-blue-500",
                    bike: "bg-emerald-600 text-white border-emerald-500",
                }[driver.vehicle_category] || "bg-gray-900 text-white";

                const driverOverlayHtml = `
                    <div class="indrive-driver-marker-box group">
                        <!-- inDrive Floating Tag / Pill directly on the car -->
                        <div class="indrive-driver-pill">
                            <span class="indrive-type-badge ${categoryBadgeColors}">${driver.car_type}</span>
                            <span class="indrive-car-model">${driver.car_name.split(" ")[0]}</span>
                            <span class="indrive-rating-chip">★ ${driver.rating}</span>
                        </div>

                        <!-- Top-down realistic vehicle icon with drop shadow -->
                        <div class="indrive-car-graphic-container">
                            <div class="car-halo"></div>
                            ${vehicleSvg}
                        </div>
                    </div>
                `;

                const overlay = new InDriveVehicleOverlay(pos, driverOverlayHtml, () => {
                    setSelectedDriverPopup(driver);
                    map.panTo(pos);
                });
                overlay.setMap(map);
                overlaysRef.current.push(overlay);
                bounds.extend(pos);
            });
        }

        // 3. TRIP PICKUP & DROPOFF PINS
        if (trip) {
            // Pickup
            const pPos = { lat: trip.pickup_lat, lng: trip.pickup_lng };
            const pMarker = new google.maps.Marker({
                position: pPos,
                map,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PICKUP_PIN_SVG)}`,
                    scaledSize: new google.maps.Size(38, 46),
                    anchor: new google.maps.Point(19, 46)
                },
                title: "Pickup Location"
            });
            markersRef.current.push(pMarker);
            bounds.extend(pPos);

            // Dropoff
            const dPos = { lat: trip.dropoff_lat, lng: trip.dropoff_lng };
            const dMarker = new google.maps.Marker({
                position: dPos,
                map,
                icon: {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DROPOFF_PIN_SVG)}`,
                    scaledSize: new google.maps.Size(38, 46),
                    anchor: new google.maps.Point(19, 46)
                },
                title: "Destination"
            });
            markersRef.current.push(dMarker);
            bounds.extend(dPos);

            // Route via Google DirectionsService
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: pPos,
                    destination: dPos,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        directionsRendererRef.current?.setDirections(result);
                    } else {
                        // Fallback straight-line polyline
                        if (polylineRef.current) polylineRef.current.setMap(null);
                        polylineRef.current = new google.maps.Polyline({
                            path: [pPos, dPos],
                            geodesic: true,
                            strokeColor: "#C69C2E",
                            strokeOpacity: 0.9,
                            strokeWeight: 5,
                            map,
                        });
                    }
                }
            );

            map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        } else if (center) {
            // Selected center if any
            const cPos = { lat: center[0], lng: center[1] };
            map.panTo(cPos);
        }
    }, [isScriptLoaded, filteredDrivers, trip, driverLocation, selectedCategory]);

    // Recenter to user's real GPS position
    const handleRecenter = () => {
        if (!mapInstanceRef.current) return;
        setIsLocating(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    mapInstanceRef.current.panTo(userPos);
                    mapInstanceRef.current.setZoom(15);
                    setIsLocating(false);
                },
                () => {
                    // Fallback to default
                    mapInstanceRef.current.panTo({ lat: 6.224, lng: 7.084 });
                    setIsLocating(false);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setIsLocating(false);
        }
    };

    // Toggle live traffic layer
    const toggleTraffic = () => {
        if (!trafficLayerRef.current || !mapInstanceRef.current) return;
        if (trafficEnabled) {
            trafficLayerRef.current.setMap(null);
            setTrafficEnabled(false);
        } else {
            trafficLayerRef.current.setMap(mapInstanceRef.current);
            setTrafficEnabled(true);
        }
    };

    // Custom Zoom
    const handleZoomIn = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    };

    const handleZoomOut = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    };

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#141414] p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Google Maps Connection Error</h4>
                <p className="text-xs text-gray-500 max-w-sm">
                    Unable to initialize live mobility map. Please check your internet connection and try again.
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
        <div className="relative w-full h-full min-h-[350px] sm:min-h-[440px] md:min-h-[500px] overflow-hidden select-none">
            {/* Scoped CSS for inDrive Vehicle Markers & Active Pulses */}
            <style>{`
                .indrive-driver-marker-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    user-select: none;
                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .indrive-driver-marker-box:hover {
                    transform: scale(1.15) translateY(-4px);
                    z-index: 50 !important;
                }
                .indrive-driver-pill {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    padding: 3px 8px;
                    border-radius: 9999px;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-bottom: 4px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    white-space: nowrap;
                }
                .dark .indrive-driver-pill {
                    background: rgba(24, 24, 27, 0.95);
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
                }
                .indrive-type-badge {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 1.5px 5.5px;
                    border-radius: 6px;
                    letter-spacing: 0.02em;
                }
                .indrive-car-model {
                    font-size: 11px;
                    font-weight: 700;
                    color: #1F2937;
                }
                .dark .indrive-car-model {
                    color: #F3F4F6;
                }
                .indrive-rating-chip {
                    font-size: 10px;
                    font-weight: 700;
                    color: #C69C2E;
                }
                .indrive-car-graphic-container {
                    position: relative;
                    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
                }

                /* Active User Car Styles (inDrive active trip) */
                .indrive-active-car-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    cursor: pointer;
                    z-index: 40 !important;
                }
                .active-pulse-ring {
                    position: absolute;
                    top: 60%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(198, 156, 46, 0.25);
                    animation: inDriveActivePulse 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
                    pointer-events: none;
                }
                .active-pulse-inner {
                    position: absolute;
                    top: 60%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(198, 156, 46, 0.4);
                    animation: inDriveActivePulse 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.6s;
                    pointer-events: none;
                }
                @keyframes inDriveActivePulse {
                    0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; }
                    100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
                }
                .indrive-active-pill {
                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                    border: 1.5px solid #C69C2E;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    box-shadow: 0 8px 20px rgba(198, 156, 46, 0.35);
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 6px;
                    white-space: nowrap;
                }
                .active-live-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22C55E;
                    box-shadow: 0 0 8px #22C55E;
                    animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .active-text-block {
                    display: flex;
                    flex-direction: column;
                }
                .active-pill-title {
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.04em;
                    color: #C69C2E;
                }
                .active-pill-sub {
                    font-size: 9px;
                    color: #E4E4E7;
                    font-weight: 500;
                }
                .active-car-graphic-wrap {
                    position: relative;
                    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45));
                }
            `}</style>

            {/* Google Map Div */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading Indicator */}
            {!isScriptLoaded && (
                <div className="absolute inset-0 bg-gray-50/90 dark:bg-[#121212]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Loading inDrive Google Maps Navigation...
                    </p>
                </div>
            )}

            {/* Top Bar: inDrive Status & Category Filter Pills */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
                {/* Live Status Chip */}
                <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-[#333] shadow-md flex items-center gap-2 pointer-events-auto">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#C69C2E]" />
                        {trip ? "Active GPS Tracking" : `${filteredDrivers.length} Drivers on Map`}
                    </span>
                </div>

                {/* inDrive Vehicle Category Filter Bar (Only when not in active trip) */}
                {!trip && (
                    <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md p-1 rounded-full border border-gray-200/80 dark:border-[#333] shadow-md flex items-center gap-1 overflow-x-auto max-w-full pointer-events-auto">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                selectedCategory === "all"
                                    ? "bg-[#C69C2E] text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedCategory("sedan")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                selectedCategory === "sedan"
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            🚗 Sedan
                        </button>
                        <button
                            onClick={() => setSelectedCategory("comfort")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                selectedCategory === "comfort"
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            ✨ Comfort
                        </button>
                        <button
                            onClick={() => setSelectedCategory("suv")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                selectedCategory === "suv"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            🚙 SUV
                        </button>
                        <button
                            onClick={() => setSelectedCategory("bike")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                selectedCategory === "bike"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                            }`}
                        >
                            🏍️ Bike
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side In-Map Action Controls */}
            <div className="absolute right-3 bottom-6 sm:bottom-8 z-10 flex flex-col gap-2">
                {/* Traffic Layer Toggle */}
                <button
                    onClick={toggleTraffic}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                        trafficEnabled
                            ? "bg-amber-500 text-white border-amber-400"
                            : "bg-white/95 dark:bg-[#1C1C1E]/95 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-[#333] hover:bg-gray-100"
                    }`}
                    title={trafficEnabled ? "Traffic Layer Active" : "Toggle Live Traffic"}
                    aria-label="Toggle live traffic"
                >
                    <TrafficCone className="w-5 h-5" />
                </button>

                {/* Recenter / GPS Button */}
                <button
                    onClick={handleRecenter}
                    className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 text-gray-700 dark:text-gray-200 hover:text-[#C69C2E] border border-gray-200 dark:border-[#333] flex items-center justify-center shadow-lg backdrop-blur-md transition-all cursor-pointer"
                    title="My Location / Recenter"
                    aria-label="Recenter map"
                >
                    {isLocating ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#C69C2E]" />
                    ) : (
                        <Crosshair className="w-5 h-5" />
                    )}
                </button>

                {/* Zoom In & Out */}
                <div className="flex flex-col bg-white/95 dark:bg-[#1C1C1E]/95 rounded-2xl border border-gray-200 dark:border-[#333] shadow-lg backdrop-blur-md overflow-hidden">
                    <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                        title="Zoom In"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="h-[1px] bg-gray-200 dark:bg-[#333]" />
                    <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                        title="Zoom Out"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* inDrive Bottom Floating Driver Detail Preview Card */}
            {selectedDriverPopup && (
                <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-auto sm:max-w-sm z-20 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-xl border border-gray-200/80 dark:border-[#2E2E32] rounded-3xl p-4 sm:p-5 shadow-2xl relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedDriverPopup(null)}
                            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C69C2E] to-[#99741b] text-white flex items-center justify-center shrink-0 shadow-md">
                                <Car className="w-6 h-6" />
                            </div>

                            <div className="flex-1 pr-6">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        {selectedDriverPopup.driver_name}
                                    </h4>
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                    {selectedDriverPopup.car_name} • <span className="font-bold text-[#C69C2E]">{selectedDriverPopup.car_type}</span>
                                </p>

                                <div className="flex items-center gap-3 text-xs mt-2 text-gray-600 dark:text-gray-300 font-semibold">
                                    <span className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {selectedDriverPopup.rating}
                                    </span>
                                    <span>•</span>
                                    <span>~{selectedDriverPopup.eta_min} min away</span>
                                    <span>•</span>
                                    <span>{selectedDriverPopup.trips} rides</span>
                                </div>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Est. Fare</span>
                                <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    ₦{selectedDriverPopup.fare?.toLocaleString() || "1,800"}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    if (onSelectDriver) {
                                        onSelectDriver(selectedDriverPopup.raw || selectedDriverPopup);
                                    }
                                    setSelectedDriverPopup(null);
                                }}
                                className="flex-1 max-w-[190px] h-10 rounded-xl bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
                            >
                                <span>Select & Offer Fare</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
