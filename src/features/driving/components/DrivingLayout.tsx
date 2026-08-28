"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RideRequestForm } from "./RideRequestForm";
import { DriversList } from "./DriversList";
import { MapView } from "./MapViewComponent";
import { RideConfirmation } from "./RideConfirmation";
import { RideNegotiationModal } from "./RideNegotiationModal";
import { RidePaymentModal } from "./RidePaymentModal";
import { SuccessModal } from "./SuccessModal";
import { DriverProfileForm } from "./DriverProfileForm";
import { RidesHistory } from "./RidesHistory";
import { DriverPublicProfileModal } from "./DriverPublicProfileModal";
import { IncomingRides, RideIntent } from "./IncomingRides";
import { ActiveTripView } from "./ActiveTripView";
import { getUserKyc } from "@/features/profile/actions";
import { pingDriverLocation, requestRide, acceptRide, getDriversNearby, cancelTrip, completeTrip, arriveAtPickup, startTrip, confirmStartTrip, counterRide, acceptCounterOffer, getDriverProfile } from "../actions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useChatContext } from "@/providers/ChatProvider";
import {
    Loader2, Car, Navigation, Clock, History, UserCircle,
    Sparkles, Shield, TrendingUp, Zap, MapPin, Activity, Banknote, Check
} from "lucide-react";

const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.warn("AudioContext block", e);
    }
};

export function DrivingLayout() {
    const [activeTab, setActiveTab] = React.useState<'book' | 'booked' | 'profile' | 'rides' | 'active_drivers'>('book');
    const [isDriverVerified, setIsDriverVerified] = React.useState(false);
    const [isKycVerified, setIsKycVerified] = React.useState(false);
    const [isLoadingKyc, setIsLoadingKyc] = React.useState(true);
    const [showDriversList, setShowDriversList] = React.useState(false);
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const [showNegotiation, setShowNegotiation] = React.useState(false);
    const [showPayment, setShowPayment] = React.useState(false);
    const [successModal, setSuccessModal] = React.useState<{ title: string; message: string } | null>(null);
    const [mapCenter, setMapCenter] = React.useState<[number, number] | null>(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [rideRequests, setRideRequests] = React.useState<RideIntent[]>([]);
    const [isAcceptingRequests, setIsAcceptingRequests] = React.useState(true);
    const [isCountryWide, setIsCountryWide] = React.useState(false);
    const [liveDrivers, setLiveDrivers] = React.useState<{ id: string, lat: number, lng: number, supported_vehicles?: string[], details?: any }[]>([]);

    // Driver: incoming ride request dialog (shown as a prominent modal for direct requests)
    const [incomingRequestDialog, setIncomingRequestDialog] = React.useState<RideIntent | null>(null);

    // Rider specific states
    const [tripData, setTripData] = React.useState<any>(null);
    const [selectedDriver, setSelectedDriver] = React.useState<{id: string; car_name: string; driver_name: string; distance_km: number} | null>(null);
    const [isWaitingForDriver, setIsWaitingForDriver] = React.useState(false);
    const [activeTrip, setActiveTrip] = React.useState<any | null>(null);
    const [driverLocation, setDriverLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const [viewDriverProfileId, setViewDriverProfileId] = React.useState<string | null>(null);
    const [counterOffer, setCounterOffer] = React.useState<{ tripId: string; counterFare: number } | null>(null);

    const vehicleRates: Record<string, { base: number, rate: number, min: number }> = {
        car: { base: 500, rate: 300, min: 1000 },
        van: { base: 800, rate: 450, min: 1500 },
        truck: { base: 1500, rate: 600, min: 3000 },
        bike: { base: 250, rate: 150, min: 500 },
        tricycle: { base: 300, rate: 200, min: 600 },
    };

    const getEstimatedFare = () => {
        if (!tripData) return 0;
        const vType = tripData.vehicle_type || "car";
        const rates = vehicleRates[vType] || vehicleRates.car;
        const dist = tripData.estimated_distance || 0;
        const subtotal = rates.base + rates.rate * dist;
        return Math.max(rates.min, subtotal);
    };

    const isWaitingForDriverRef = React.useRef(isWaitingForDriver);
    const waitingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const activeTripRef = React.useRef(activeTrip);
    const isDriverVerifiedRef = React.useRef(isDriverVerified);

    React.useEffect(() => {
        isWaitingForDriverRef.current = isWaitingForDriver;
    }, [isWaitingForDriver]);

    React.useEffect(() => {
        activeTripRef.current = activeTrip;
    }, [activeTrip]);

    React.useEffect(() => {
        isDriverVerifiedRef.current = isDriverVerified;
    }, [isDriverVerified]);

    const { data: session } = useSession();
    const { clearUnreadRideRequests } = useChatContext();

    React.useEffect(() => {
        clearUnreadRideRequests();
    }, [clearUnreadRideRequests]);

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // WebSocket Connection
    React.useEffect(() => {
        if (!session?.backendToken) return;

        const token = session.backendToken.replace(/^"|"$/g, '');
        // We use the general chat WS since it uses ConnectionManager that routes per user
        const getWsUrl = () => {
            if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
            if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
            return 'wss://dge-tech-web-cjhe4jg72a-ew.a.run.app';
        };
        const wsUrl = `${getWsUrl()}/chat/ws?token=${token}`;

        let ws: WebSocket;
        let isComponentMounted = true;

        const connect = () => {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("DrivingLayout: Connected to WS");
                // Ask to join global driving room if rider
                ws.send(JSON.stringify({ action: "join", conversation_id: "driving_global" }));

                // Join country-wide room if enabled
                if (isCountryWide) {
                    ws.send(JSON.stringify({ action: "join", conversation_id: "driving_requests_global" }));
                }
            };

            ws.onmessage = (event) => {
                if (!isComponentMounted) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "incoming_ride_intent" || data.type === "ride_request") {
                        if (isAcceptingRequests) {
                            playNotificationSound();
                            setRideRequests(prev => {
                                // Filter out old requests from same rider to ensure direct request replaces broadcast
                                const filtered = prev.filter(r => r.rider_id !== data.rider_id);
                                return [data, ...filtered];
                            });
                            // Show prominent dialog for direct ride requests to verified drivers
                            if (data.type === "ride_request" && data.trip_id && isDriverVerifiedRef.current) {
                                setIncomingRequestDialog(data);
                            }
                        }
                    } else if (data.type === "driver_location") {
                        // Handle driver location updates for riders browsing map
                        setLiveDrivers(prev => {
                            const existing = prev.find(d => d.id === data.driver_id);
                            const filtered = prev.filter(d => d.id !== data.driver_id);
                            return [...filtered, {
                                id: data.driver_id,
                                lat: data.lat,
                                lng: data.lng,
                                supported_vehicles: data.supported_vehicles || existing?.supported_vehicles || ["car"],
                                details: data.details
                            }];
                        });
                    } else if (data.type === 'location_update') {
                        setDriverLocation({ lat: data.lat, lng: data.lng });
                    } else if (data.type === 'ride_counter_offer') {
                        setCounterOffer({
                            tripId: data.trip_id,
                            counterFare: data.counter_fare
                        });
                        playNotificationSound();
                    } else if (data.type === 'ride_accepted') {
                        setIsWaitingForDriver(false);
                        setCounterOffer(null);
                        if (waitingTimeoutRef.current) {
                            clearTimeout(waitingTimeoutRef.current);
                            waitingTimeoutRef.current = null;
                        }
                        setShowConfirmation(false);
                        setSuccessModal({
                            title: "Ride Accepted",
                            message: "Your driver is on the way!"
                        });
                        // Refresh active trip to show the ActiveTripView
                        import('../actions').then(m => m.getActiveTrip().then(res => {
                            if (res.success && res.data) setActiveTrip(res.data);
                        }));
                    } else if (data.type === 'ride_cancelled' || data.type === 'ride_request_timeout') {
                        // Dismiss driver's incoming request dialog if it matches the cancelled trip
                        setIncomingRequestDialog(prev => {
                            if (prev && prev.trip_id === data.trip_id) return null;
                            return prev;
                        });
                        setCounterOffer(null);
                        setIsWaitingForDriver(false);
                        setSelectedDriver(null);
                        setTripData(null);
                        if (isWaitingForDriverRef.current) {
                            if (waitingTimeoutRef.current) {
                                clearTimeout(waitingTimeoutRef.current);
                                waitingTimeoutRef.current = null;
                            }
                            setSuccessModal({
                                title: "Request Declined",
                                message: "The driver declined your request. Please select another driver."
                            });
                        } else if (activeTripRef.current && activeTripRef.current.id === data.trip_id) {
                            setActiveTrip(null);
                            setDriverLocation(null);
                            setSuccessModal({
                                title: "Ride Cancelled",
                                message: "This ride has been cancelled."
                            });
                        }
                    } else if (data.type === 'ride_completed') {
                        if (activeTripRef.current && activeTripRef.current.id === data.trip_id) {
                            const currentUserId = (session?.user as any)?.id || session?.user?.id;
                            const isTripRider = currentUserId ? (activeTripRef.current.rider_id === currentUserId) : !isDriverVerifiedRef.current;
                            if (isTripRider) {
                                // Rider: Update the trip with final fare and show payment modal
                                setActiveTrip((prev: any) => ({ ...prev, final_fare: data.final_fare }));
                                setShowPayment(true);
                            } else {
                                // Driver: Clear the trip and show success modal
                                setActiveTrip(null);
                                setDriverLocation(null);
                                setSuccessModal({ title: "Ride Completed", message: "You have completed the ride." });
                            }
                        }
                    } else if (data.type === 'driver_arrived') {
                        if (activeTripRef.current && activeTripRef.current.id === data.trip_id) {
                            setActiveTrip((prev: any) => ({ ...prev, status: 'arrived' }));
                            const currentUserId = (session?.user as any)?.id || session?.user?.id;
                            const isTripRider = currentUserId ? (activeTripRef.current.rider_id === currentUserId) : !isDriverVerifiedRef.current;
                            if (isTripRider) {
                                playNotificationSound();
                                setSuccessModal({ title: "Driver Arrived", message: "Your driver has arrived at the pickup location." });
                            }
                        }
                    } else if (data.type === 'trip_start_requested') {
                        if (activeTripRef.current && activeTripRef.current.id === data.trip_id) {
                            setActiveTrip((prev: any) => ({ ...prev, status: 'awaiting_confirmation' }));
                            const currentUserId = (session?.user as any)?.id || session?.user?.id;
                            const isTripRider = currentUserId ? (activeTripRef.current.rider_id === currentUserId) : !isDriverVerifiedRef.current;
                            if (isTripRider) {
                                playNotificationSound();
                                setSuccessModal({ title: "Start Trip?", message: "Your driver has requested to start the trip. Please confirm." });
                            }
                        }
                    } else if (data.type === 'trip_started') {
                        if (activeTripRef.current && activeTripRef.current.id === data.trip_id) {
                            setActiveTrip((prev: any) => ({ ...prev, status: 'in_progress' }));
                            const currentUserId = (session?.user as any)?.id || session?.user?.id;
                            const isTripRider = currentUserId ? (activeTripRef.current.rider_id === currentUserId) : !isDriverVerifiedRef.current;
                            if (!isTripRider) {
                                playNotificationSound();
                                setSuccessModal({ title: "Trip Started", message: "The passenger has confirmed the trip." });
                            }
                        }
                    }
                } catch (e) {
                    console.error("DrivingLayout WS parsing error", e);
                }
            };

            ws.onclose = () => {
                if (isComponentMounted) {
                    setTimeout(connect, 3000); // Auto reconnect
                }
            };
        };

        connect();

        return () => {
            isComponentMounted = false;
            if (ws) ws.close();
        };
    }, [session, isAcceptingRequests, isCountryWide]);

    // Driver Location Ping Loop
    React.useEffect(() => {
        if (!isDriverVerified || !isAcceptingRequests) return;

        const ping = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        pingDriverLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            is_available: true
                        }).catch(err => console.error("Ping error:", err));
                    },
                    (err) => console.warn("Geolocation for ping failed:", err)
                );
            }
        };

        // Initial ping
        ping();

        // Ping every 10 seconds
        const interval = setInterval(ping, 10000);
        return () => clearInterval(interval);
    }, [isDriverVerified, isAcceptingRequests]);

    // Fetch initial active trip on mount
    React.useEffect(() => {
        if (!session?.backendToken) return;
        import('../actions').then(m => {
            m.getActiveTrip().then(res => {
                if (res.success && res.data) {
                    setActiveTrip(res.data);
                    const isPending = res.data.status.toUpperCase() === 'PENDING';
                    const currentUserId = (session?.user as any)?.id || session?.user?.id;
                    const isRider = currentUserId ? (res.data.rider_id === currentUserId) : false;

                    if (isPending) {
                        if (isRider) {
                            setIsWaitingForDriver(true);
                        } else {
                            // Driver side: populate incoming request dialog so the Accept/Counter modal shows!
                            setIncomingRequestDialog({
                                trip_id: res.data.id,
                                rider_id: res.data.rider_id,
                                rider_name: res.data.rider_name || "Passenger",
                                rider_avatar: res.data.rider_avatar,
                                pickup: { lat: res.data.pickup_lat, lng: res.data.pickup_lng, address: res.data.pickup_address },
                                dropoff: { lat: res.data.dropoff_lat, lng: res.data.dropoff_lng, address: res.data.dropoff_address },
                                negotiated_fare: res.data.negotiated_fare,
                                estimated_fare: res.data.estimated_fare,
                                distance_km: res.data.distance_km,
                                distance_to_pickup_km: 1.0,
                                type: "ride_request"
                            });
                        }
                    }
                }
            }).catch(console.error);
        });
    }, [session, isDriverVerified]);

    // Restore ride ordering state from localStorage if valid (< 1 hour)
    React.useEffect(() => {
        try {
            const savedStateStr = localStorage.getItem("dge_ride_order_state");
            if (savedStateStr) {
                const saved = JSON.parse(savedStateStr);
                const ageMs = Date.now() - saved.savedAt;
                if (ageMs < 3600000) { // 1 hour
                    if (saved.tripData) setTripData(saved.tripData);
                    if (saved.selectedDriver) setSelectedDriver(saved.selectedDriver);
                    if (saved.showConfirmation !== undefined) setShowConfirmation(saved.showConfirmation);
                    if (saved.showNegotiation !== undefined) setShowNegotiation(saved.showNegotiation);
                    if (saved.counterOffer !== undefined) setCounterOffer(saved.counterOffer);
                } else {
                    localStorage.removeItem("dge_ride_order_state");
                }
            }
        } catch (e) {
            console.error("Failed to restore ride ordering state:", e);
        }
    }, []);

    // Save ride ordering state to localStorage when it changes
    React.useEffect(() => {
        try {
            if (!tripData && !selectedDriver && !showConfirmation && !showNegotiation && !counterOffer) {
                localStorage.removeItem("dge_ride_order_state");
            } else {
                const stateToSave = {
                    tripData,
                    selectedDriver,
                    showConfirmation,
                    showNegotiation,
                    counterOffer,
                    savedAt: Date.now()
                };
                localStorage.setItem("dge_ride_order_state", JSON.stringify(stateToSave));
            }
        } catch (e) {
            console.error("Failed to save ride ordering state:", e);
        }
    }, [tripData, selectedDriver, showConfirmation, showNegotiation, counterOffer]);

    // Fetch initial active drivers for map
    React.useEffect(() => {
        if (isDriverVerified || liveDrivers.length > 0) return;

        const fetchInitialDrivers = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        const drivers = await getDriversNearby(position.coords.latitude, position.coords.longitude);
                        setLiveDrivers(drivers.map(d => ({
                            id: d.driver_id,
                            lat: d.latitude,
                            lng: d.longitude,
                            supported_vehicles: d.supported_vehicles || ["car"],
                            details: {
                                name: d.driver_name,
                                car_name: d.car_name,
                            }
                        })));
                    } catch (e) {
                        console.error("Failed to fetch initial active drivers", e);
                    }
                });
            }
        };
        fetchInitialDrivers();
    }, [isDriverVerified]);

    React.useEffect(() => {
        const checkKyc = async () => {
            setIsLoadingKyc(true);
            const res = await getUserKyc();
            if (res.success && res.data) {
                if (res.data.status === 'verified') {
                    setIsKycVerified(true);
                }
            }
            const dres = await getDriverProfile();
            if (dres.success && dres.data) {
                if (dres.data.license_status === 'verified') {
                    setIsDriverVerified(true);
                }
            }
            setIsLoadingKyc(false);
        };
        checkKyc();
    }, []);

    const handleBecomeDriverClick = () => {
        if (!isKycVerified) {
            toast.error("Identity verification is required to become a driver. Redirecting to KYC verification...");
            setTimeout(() => {
                window.location.href = "/dashboard/profile?tab=kyc";
            }, 1500);
        } else {
            window.location.href = "/dashboard/profile?tab=driver";
        }
    };

    // Driver GPS simulation during active trip
    React.useEffect(() => {
        if (!isDriverVerified || !activeTrip || activeTrip.status !== 'ACTIVE') {
            return;
        }

        let step = 0;
        const totalSteps = 15;
        const intervalTime = 2500; // 2.5 seconds per step

        const runSim = async () => {
            if (step > totalSteps) return;

            const t = step / totalSteps;
            const currentLat = activeTrip.pickup_lat + (activeTrip.dropoff_lat - activeTrip.pickup_lat) * t;
            const currentLng = activeTrip.pickup_lng + (activeTrip.dropoff_lng - activeTrip.pickup_lng) * t;

            await pingDriverLocation({
                latitude: currentLat,
                longitude: currentLng,
                is_available: false
            }).catch(err => console.error("Sim ping error:", err));

            setDriverLocation({ lat: currentLat, lng: currentLng });
            step++;
        };

        runSim();
        const timer = setInterval(runSim, intervalTime);

        return () => {
            clearInterval(timer);
        };
    }, [isDriverVerified, activeTrip]);

    const handleNegotiationSubmit = async (fare: number) => {
        setShowNegotiation(false);
        setIsWaitingForDriver(true);

        // 60-second timeout
        const timeout = setTimeout(() => {
            setIsWaitingForDriver(false);
            setSuccessModal({
                title: "Timeout",
                message: "The driver did not respond in time. Please select another driver."
            });
        }, 60000);
        waitingTimeoutRef.current = timeout;

        if (tripData && selectedDriver) {
            const res = await requestRide({
                ...tripData,
                driver_id: selectedDriver.id,
                negotiated_fare: fare
            });
            if (!res.success) {
                clearTimeout(timeout);
                waitingTimeoutRef.current = null;
                setIsWaitingForDriver(false);
                setSuccessModal({
                    title: "Error Requesting Ride",
                    message: res.error || "Failed to submit request. You might have an existing active ride."
                });
            }
        }
    };

    const handlePayment = () => {
        setShowPayment(false);
        setActiveTrip(null);
        setSelectedDriver(null);
        setTripData(null);
        setDriverLocation(null);
        setSuccessModal({
            title: "Payment Successful",
            message: "Thank you for riding with us! Your payment was successful."
        });
    };

    const handleLocationSelect = (lat: number, lon: number) => {
        setMapCenter([lat, lon]);
    };

    const tabs = [
        { key: 'book' as const, label: 'Book a Ride', icon: Car, desc: 'Find nearby drivers' },
        ...(isDriverVerified
            ? [
                { key: 'booked' as const, label: 'Incoming Rides', icon: Navigation, desc: 'Rides booked from you' },
                { key: 'profile' as const, label: 'Driver Profile', icon: UserCircle, desc: 'Vehicle details' }
            ]
            : (isKycVerified
                ? [
                    { key: 'profile' as const, label: 'Become a Driver', icon: UserCircle, desc: 'Register as driver' },
                    { key: 'active_drivers' as const, label: 'Active Drivers', icon: Activity, desc: 'See live drivers' }
                ]
                : [
                    { key: 'active_drivers' as const, label: 'Active Drivers', icon: Activity, desc: 'See live drivers' }
                ]
            )),
    ];

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const currentUserId = (session?.user as any)?.id || session?.user?.id;
    const isCurrentRider = activeTrip ? (currentUserId === activeTrip.rider_id) : false;
    const isCurrentDriver = activeTrip
        ? (activeTrip.driver_user_id ? currentUserId === activeTrip.driver_user_id : (!isCurrentRider && isDriverVerified))
        : isDriverVerified;

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col relative -mt-4 md:-mt-8 -mx-4 md:-mx-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] overflow-hidden">
            {/* Modals */}
            {showNegotiation && (
                <RideNegotiationModal
                    onClose={() => setShowNegotiation(false)}
                    onSubmit={handleNegotiationSubmit}
                    estimatedFare={getEstimatedFare()}
                />
            )}
            {showPayment && (
                <RidePaymentModal
                    tripId={activeTrip?.id || ""}
                    onClose={() => setShowPayment(false)}
                    onPayment={handlePayment}
                    amountToPay={activeTrip?.final_fare || activeTrip?.estimated_fare || 0}
                />
            )}
            {viewDriverProfileId && (
                <DriverPublicProfileModal
                    driverId={viewDriverProfileId}
                    onClose={() => setViewDriverProfileId(null)}
                />
            )}
            {successModal && (
                <SuccessModal
                    title={successModal.title}
                    message={successModal.message}
                    onClose={() => {
                        setSuccessModal(null);
                    }}
                />
            )}

            {/* Waiting for Driver Modal (Rider Side) */}
            {isWaitingForDriver && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm relative shadow-2xl overflow-hidden p-8 text-center flex flex-col items-center">
                        {counterOffer ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-[#C69C2E]/10 flex items-center justify-center mb-6 relative">
                                    <Banknote className="w-8 h-8 text-[#C69C2E]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Counter Offer Received!</h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    The driver proposed a fare of <span className="font-bold text-green-600 text-base">₦{counterOffer.counterFare.toLocaleString()}</span>.
                                </p>
                                <div className="flex flex-col gap-2.5 w-full">
                                    <Button
                                        onClick={async () => {
                                            const res = await acceptCounterOffer(counterOffer.tripId);
                                            if (res.success) {
                                                setIsWaitingForDriver(false);
                                                setCounterOffer(null);
                                                setShowConfirmation(false);
                                                if (res.data) setActiveTrip(res.data);
                                                setSuccessModal({
                                                    title: "Counter Offer Accepted",
                                                    message: "You have accepted the driver's offer."
                                                });
                                            } else {
                                                toast.error("Failed to accept counter offer: " + res.error);
                                            }
                                        }}
                                        className="w-full text-xs h-10 bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold"
                                    >
                                        Accept Offer (₦{counterOffer.counterFare.toLocaleString()})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const res = await cancelTrip(counterOffer.tripId, 'declined');
                                            if (res.success) {
                                                setIsWaitingForDriver(false);
                                                setCounterOffer(null);
                                                setSuccessModal({
                                                    title: "Offer Declined",
                                                    message: "You declined the offer and cancelled the ride request."
                                                });
                                            } else {
                                                toast.error("Failed to cancel: " + res.error);
                                            }
                                        }}
                                        className="w-full text-xs h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        Decline & Cancel Request
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 relative">
                                    <Car className="w-8 h-8 text-indigo-500 relative z-10" />
                                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-2xl animate-ping" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">Waiting for Driver</h2>
                                <p className="text-sm text-gray-500 mb-6">
                                    We've sent your request to the driver. Waiting for them to accept...
                                </p>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Incoming Ride Request Dialog (Driver Side) */}
            {incomingRequestDialog && isDriverVerified && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm relative shadow-2xl overflow-hidden flex flex-col items-center">
                        {/* Pulsing header */}
                        <div className="w-full bg-gradient-to-r from-[#C69C2E] to-[#e6b93d] px-6 py-5 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                                    <Navigation className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-white">New Ride Request!</h2>
                                <p className="text-xs text-white/80 mt-1">A passenger is waiting for your response</p>
                            </div>
                        </div>

                        {/* Route details */}
                        <div className="w-full px-6 py-5 space-y-4">
                            <div className="relative flex gap-3 ml-1">
                                <div className="flex flex-col items-center pt-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#C69C2E] ring-3 ring-[#C69C2E]/10" />
                                    <div className="w-0.5 flex-1 my-1.5 min-h-[20px]" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #C69C2E40 0px, #C69C2E40 3px, transparent 3px, transparent 6px)' }} />
                                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-900 ring-3 ring-gray-900/10" />
                                </div>
                                <div className="space-y-4 pb-1 flex-1">
                                    <div>
                                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                                        <p className="text-sm text-gray-900 font-medium line-clamp-1">{incomingRequestDialog.pickup?.address || 'Pickup location'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Dropoff</p>
                                        <p className="text-sm text-gray-900 font-medium line-clamp-1">{incomingRequestDialog.dropoff?.address || 'Dropoff location'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fare & distance info */}
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-medium">Fare</p>
                                    <p className="text-base font-bold text-[#C69C2E]">
                                        ₦{(incomingRequestDialog.negotiated_fare || incomingRequestDialog.estimated_fare || 0).toLocaleString()}
                                    </p>
                                    {incomingRequestDialog.negotiated_fare && (
                                        <p className="text-[9px] text-green-600 font-semibold">Rider Offer</p>
                                    )}
                                </div>
                                <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-medium">Distance</p>
                                    <p className="text-base font-bold text-gray-900">{(incomingRequestDialog.distance_km || 0).toFixed(1)} km</p>
                                </div>
                                <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-medium">Pickup</p>
                                    <p className="text-base font-bold text-gray-900">{Math.ceil((incomingRequestDialog.distance_to_pickup_km || 0) * 2)} min</p>
                                </div>
                            </div>

                            {/* Progress bar / timer */}
                            <div className="w-full">
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Time remaining</span>
                                    <span className="text-red-400 font-semibold">Respond quickly!</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#C69C2E] animate-[shrink_30s_linear_forwards]" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-2.5">
                            <Button
                                onClick={async () => {
                                    const req = incomingRequestDialog;
                                    setIncomingRequestDialog(null);
                                    if (req.trip_id) {
                                        const res = await acceptRide(req.trip_id);
                                        if (res.success) {
                                            setRideRequests(prev => prev.filter(r => r.trip_id !== req.trip_id));
                                            if (res.data) setActiveTrip(res.data);
                                            setSuccessModal({ title: "Ride Accepted", message: "You have accepted the ride request. Head to the pickup location!" });
                                        } else {
                                            setSuccessModal({ title: "Error", message: res.error || "Failed to accept ride." });
                                        }
                                    }
                                }}
                                className="w-full h-12 bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#C69C2E]/20"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Accept Ride
                            </Button>
                            <div className="flex gap-2.5">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIncomingRequestDialog(null);
                                        setActiveTab('booked');
                                    }}
                                    className="flex-1 h-10 border-[#C69C2E]/30 text-[#C69C2E] hover:bg-[#C69C2E]/5 rounded-xl text-xs font-semibold"
                                >
                                    <Banknote className="w-3.5 h-3.5 mr-1.5" />
                                    Counter Offer
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        const req = incomingRequestDialog;
                                        setIncomingRequestDialog(null);
                                        setRideRequests(prev => prev.filter(r => r.rider_id !== req.rider_id));
                                        if (req.trip_id) {
                                            await cancelTrip(req.trip_id, 'declined');
                                        }
                                    }}
                                    className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-semibold"
                                >
                                    Decline
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0D0D0D] via-[#1a1710] to-[#0D0D0D] px-4 md:px-8 pt-6 pb-8 md:pt-8 md:pb-10">
                {/* Ambient particles */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#C69C2E]/8 blur-[100px]" />
                <div className="absolute bottom-0 left-1/4 w-[200px] h-[200px] rounded-full bg-[#C69C2E]/5 blur-[80px]" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(rgba(198,156,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(198,156,46,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative z-10">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[#C69C2E] text-xs font-semibold tracking-widest uppercase mb-1">{getGreeting()}</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/15 border border-[#C69C2E]/25 flex items-center justify-center">
                                    <Car className="w-5 h-5 text-[#C69C2E]" />
                                </div>
                                DGE Rides
                            </h1>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            {/* Live time */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <Clock className="h-3.5 w-3.5 text-[#C69C2E]" />
                                <span className="text-xs font-mono text-white/70">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                            <Button
                                onClick={() => setActiveTab('rides')}
                                variant="outline"
                                className="border-[#C69C2E]/30 text-[#C69C2E] hover:bg-[#C69C2E]/10 rounded-xl px-5 h-9 text-xs font-semibold bg-transparent"
                            >
                                <History className="h-3.5 w-3.5 mr-2" />
                                Ride History
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                        {[
                            { icon: Zap, label: 'Avg. Match', value: '28s', color: '#F59E0B' },
                            { icon: Shield, label: 'Safety Score', value: '99.2%', color: '#10B981' },
                            { icon: TrendingUp, label: 'Surge', value: '1.0×', color: '#3B82F6' },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 md:gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                                    <stat.icon className="h-3.5 w-3.5 md:h-4 md:w-4" style={{ color: stat.color }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-[11px] text-white/40 font-medium truncate">{stat.label}</p>
                                    <p className="text-sm md:text-base font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tab Navigation — Mobile App Style */}
                    <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2.5 px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 cursor-pointer ${isActive
                                        ? 'bg-[#C69C2E] text-white shadow-lg shadow-[#C69C2E]/25'
                                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                        {/* Mobile Ride History button */}
                        <button
                            onClick={() => setActiveTab('rides')}
                            className={`md:hidden flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 cursor-pointer ${activeTab === 'rides'
                                ? 'bg-[#C69C2E] text-white shadow-lg shadow-[#C69C2E]/25'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
                                }`}
                        >
                            <History className="h-4 w-4" />
                            <span>History</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden relative z-0">
                {activeTrip ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full animate-in fade-in duration-300">
                        <div className="lg:col-span-1 h-auto lg:h-[calc(100vh-380px)] min-h-0">
                            <ActiveTripView
                                trip={activeTrip}
                                isDriver={isCurrentDriver}
                                driverLocation={driverLocation}
                                onCancel={async (id) => {
                                    await cancelTrip(id);
                                    setActiveTrip(null);
                                    setDriverLocation(null);
                                    setIsWaitingForDriver(false);
                                    setCounterOffer(null);
                                    setSelectedDriver(null);
                                    setTripData(null);
                                    setSuccessModal({ title: "Ride Cancelled", message: "You have cancelled the ride." });
                                }}
                                onComplete={async (id) => {
                                    const res = await completeTrip(id);
                                    if (res.success) {
                                        setActiveTrip(null);
                                        setDriverLocation(null);
                                        setSuccessModal({ title: "Ride Completed", message: "You have successfully completed the ride." });
                                    } else {
                                        alert("Failed to complete trip: " + res.error);
                                    }
                                }}
                                onArrive={async (id) => {
                                    const res = await arriveAtPickup(id);
                                    if (res.success) setActiveTrip((prev: any) => ({ ...prev, status: 'arrived' }));
                                }}
                                onStartTrip={async (id) => {
                                    const res = await startTrip(id);
                                    if (res.success) setActiveTrip((prev: any) => ({ ...prev, status: 'awaiting_confirmation' }));
                                }}
                                onConfirmStart={async (id) => {
                                    const res = await confirmStartTrip(id);
                                    if (res.success) {
                                        setActiveTrip((prev: any) => ({ ...prev, status: 'in_progress' }));
                                    } else {
                                        alert("Failed to confirm trip start: " + res.error);
                                    }
                                }}
                            />
                        </div>
                        <div className="lg:col-span-2 h-[400px] md:h-[500px] lg:h-[calc(100vh-380px)] min-h-[350px]">
                            <MapView center={mapCenter} liveDrivers={liveDrivers} trip={activeTrip} driverLocation={driverLocation} />
                        </div>
                    </div>
                ) : activeTab === 'rides' ? (
                    <div className="h-full animate-in fade-in duration-300">
                        <RidesHistory />
                    </div>
                ) : activeTab === 'profile' ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
                        <DriverProfileForm
                            isAccepting={isAcceptingRequests}
                            onToggleAccepting={(val) => setIsAcceptingRequests(val)}
                        />
                    </div>
                ) : activeTab === 'booked' && isDriverVerified ? (
                    <div className="h-full animate-in fade-in duration-300 max-w-2xl mx-auto">
                        <IncomingRides
                            rideRequests={rideRequests}
                            isCountryWide={isCountryWide}
                            onToggleCountryWide={(val) => setIsCountryWide(val)}
                            onCounter={async (req, counterFare) => {
                                if (req.trip_id) {
                                    const res = await counterRide(req.trip_id, counterFare);
                                    if (res.success) {
                                        setRideRequests(prev => prev.map(r => r.trip_id === req.trip_id ? { ...r, negotiated_fare: counterFare } : r));
                                        setSuccessModal({ title: "Counter Offer Sent", message: `Your counter offer of ₦${counterFare.toLocaleString()} has been sent to the rider.` });
                                    } else {
                                        alert("Failed to send counter offer: " + res.error);
                                    }
                                }
                            }}
                            onAccept={async (req) => {
                                if (req.trip_id) {
                                    const res = await acceptRide(req.trip_id);
                                    if (res.success) {
                                        setRideRequests(prev => prev.filter(r => r.trip_id !== req.trip_id));
                                        if (res.data) setActiveTrip(res.data);
                                        setSuccessModal({ title: "Ride Accepted", message: "You have accepted the direct ride request." });
                                    } else {
                                        alert("Failed to accept ride: " + res.error);
                                    }
                                } else {
                                    // Handle generic broadcast acceptance via create/accept trip
                                    setRideRequests(prev => prev.filter(r => r.rider_id !== req.rider_id));
                                    setSuccessModal({ title: "Ride Accepted", message: "You have accepted the ride request." });
                                }
                            }}
                            onReject={async (req) => {
                                setRideRequests(prev => prev.filter(r => r.rider_id !== req.rider_id));
                                if (req.trip_id) {
                                    await cancelTrip(req.trip_id, 'declined');
                                }
                            }}
                        />
                    </div>
                ) : activeTab === 'active_drivers' && !isDriverVerified ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full">
                        <div className="lg:col-span-1 h-auto lg:h-[calc(100vh-380px)] min-h-0 animate-in slide-in-from-left duration-300">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center p-8">
                                <div className="relative mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-[#C69C2E]/10 flex items-center justify-center">
                                        <Activity className="w-7 h-7 text-[#C69C2E]" />
                                    </div>
                                    <div className="absolute -inset-2 rounded-2xl border-2 border-[#C69C2E]/20 animate-ping" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">Live Driver Tracking</h3>
                                <p className="text-sm text-gray-500 text-center">
                                    There are currently <span className="font-bold text-[#C69C2E]">{liveDrivers.length}</span> live drivers active in your area.
                                </p>
                                <Button onClick={() => setActiveTab('book')} className="mt-6 bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-xl">
                                    Book a Ride Now
                                </Button>
                            </div>
                        </div>
                        <div className="lg:col-span-2 h-[400px] md:h-[500px] lg:h-[calc(100vh-380px)] min-h-[350px] animate-in slide-in-from-right duration-300">
                            <MapView center={mapCenter} liveDrivers={liveDrivers} trip={activeTrip} driverLocation={driverLocation} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full">
                        {/* Left Panel — Form / Drivers / Confirmation */}
                        <div className="lg:col-span-1 h-auto lg:h-[calc(100vh-380px)] min-h-0 overflow-y-auto pr-1 pb-4 animate-in slide-in-from-left duration-300">
                            {showConfirmation && selectedDriver ? (
                                <RideConfirmation
                                    driver={selectedDriver}
                                    tripData={tripData}
                                    estimatedFare={getEstimatedFare()}
                                    onBack={() => setShowConfirmation(false)}
                                    onNegotiate={() => setShowNegotiation(true)}
                                    onBook={async () => {
                                        setIsWaitingForDriver(true);
                                        // 60-second timeout
                                        const timeout = setTimeout(() => {
                                            setIsWaitingForDriver(false);
                                            setSuccessModal({
                                                title: "Timeout",
                                                message: "The driver did not respond in time. Please select another driver."
                                            });
                                        }, 60000);
                                        waitingTimeoutRef.current = timeout;

                                        const res = await requestRide({ ...tripData, driver_id: selectedDriver.id });
                                        if (!res.success) {
                                            clearTimeout(timeout);
                                            waitingTimeoutRef.current = null;
                                            setIsWaitingForDriver(false);
                                            setSuccessModal({
                                                title: "Error Requesting Ride",
                                                message: res.error || "Failed to submit request. You might have an existing active ride."
                                            });
                                        }
                                    }}
                                />
                            ) : showDriversList ? (
                                <DriversList
                                    tripDistance={tripData?.estimated_distance || 0}
                                    onBack={() => setShowDriversList(false)}
                                    onContinue={(driver) => {
                                        setSelectedDriver({ id: driver.driver_id, car_name: driver.car_name, driver_name: driver.driver_name, distance_km: driver.distance_km });
                                        setShowConfirmation(true);
                                    }}
                                    onViewDriverProfile={setViewDriverProfileId}
                                    vehicleType={tripData?.vehicle_type}
                                />
                            ) : (
                                <div className="space-y-4 flex flex-col">
                                    {!isDriverVerified && (
                                        <div className="bg-gradient-to-br from-[#1E1B10] to-[#0D0D0D] border border-[#C69C2E]/20 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden group shrink-0">
                                            {/* Decorative glowing gradient */}
                                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C69C2E]/10 blur-2xl group-hover:bg-[#C69C2E]/15 transition-all duration-500 pointer-events-none" />
                                            <div className="flex gap-4 items-start relative z-10">
                                                <div className="w-10 h-10 rounded-xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 flex items-center justify-center shrink-0">
                                                    <Car className="w-5 h-5 text-[#C69C2E]" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-bold text-white">Earn Money with DGE</h3>
                                                    <p className="text-xs text-gray-400 leading-relaxed">
                                                        Become a driver, register your vehicle, and start accepting ride requests.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={handleBecomeDriverClick}
                                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white text-xs h-10 font-bold rounded-xl relative z-10 transition-all shadow-md shadow-[#C69C2E]/10"
                                            >
                                                Register as a Driver
                                            </Button>
                                        </div>
                                    )}
                                    <RideRequestForm
                                        liveDrivers={liveDrivers}
                                        onSubmit={(data) => {
                                            setTripData(data);
                                            setShowDriversList(true);
                                        }}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Panel — Map */}
                        <div className="lg:col-span-2 h-[400px] md:h-[500px] lg:h-[calc(100vh-380px)] min-h-[350px] animate-in slide-in-from-right duration-300">
                            <MapView center={mapCenter} liveDrivers={liveDrivers} trip={activeTrip} driverLocation={driverLocation} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
