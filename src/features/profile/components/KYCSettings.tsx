import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, X } from "lucide-react";
import { getUserKyc, getProfile, getKycConfig, getSumsubToken } from "../actions";

export function KYCSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kycData, setKycData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [activeProvider, setActiveProvider] = useState<string>("sumsub");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [sdkError, setSdkError] = useState(false);
    const [sumsubToken, setSumsubToken] = useState<string | null>(null);

    const metamapRef = useRef<HTMLDivElement>(null);
    const sumsubContainerRef = useRef<HTMLDivElement>(null);
    const sumsubInstanceRef = useRef<any>(null);

    const fetchKyc = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const configRes = await getKycConfig();
            if (configRes.success && configRes.data?.active_provider) {
                setActiveProvider(configRes.data.active_provider);
            }

            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                setUserId(profileRes.data.user_id);
            }
            
            const res = await getUserKyc();
            if (res.success && res.data) {
                setKycData(res.data);
            }
        } catch (err: any) {
            console.error("Error fetching KYC status:", err);
            setError("Failed to load KYC configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    // Load MetaMap SDK
    const loadMetaMapSdk = useCallback(() => {
        setSdkError(false);
        setSdkLoaded(false);

        document.querySelectorAll('script[src*="metamap.com"]').forEach(el => el.remove());

        const script = document.createElement("script");
        script.src = "https://web-button.metamap.com/button.js";
        script.async = true;
        script.onload = () => {
            setSdkLoaded(true);
            setSdkError(false);
        };
        script.onerror = () => {
            setSdkError(true);
            setSdkLoaded(false);
        };
        document.body.appendChild(script);
        return script;
    }, []);

    // Preload SDK script for instant launch speed
    useEffect(() => {
        if (typeof window !== "undefined" && !window.snsWebSdk) {
            const script = document.createElement("script");
            script.src = "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Load Sumsub SDK & Initialize Container
    const initSumsubSdk = useCallback(async () => {
        setSdkError(false);
        setSdkLoaded(false);

        const tokenRes = await getSumsubToken();
        if (!tokenRes.success || !tokenRes.data?.token) {
            setSdkError(true);
            setError(tokenRes.error || "Failed to generate verification access token.");
            return;
        }

        const accessToken = tokenRes.data.token;
        setSumsubToken(accessToken);

        const launchSdk = () => {
            if (!window.snsWebSdk) {
                setSdkError(true);
                return;
            }

            try {
                if (sumsubContainerRef.current) {
                    sumsubContainerRef.current.innerHTML = "";
                }

                const snsWebSdkInstance = window.snsWebSdk
                    .init(
                        accessToken,
                        async () => {
                            const newTokenRes = await getSumsubToken();
                            return newTokenRes.data?.token || accessToken;
                        }
                    )
                    .withConf({ lang: "en", theme: "dark" })
                    .withOptions({ addViewportTag: true, adaptIframeHeight: true })
                    .onMessage((type: string, payload: any) => {
                        console.log("WebSDK event:", type, payload);
                        if (type === "idCheck.onApplicantStatusChanged" || type === "idCheck.onStepCompleted") {
                            fetchKyc();
                        }
                    })
                    .on("idCheck.onApplicantStatusChanged", (payload: any) => {
                        console.log("Status changed:", payload);
                        fetchKyc();
                    })
                    .build();

                snsWebSdkInstance.launch("#sumsub-websdk-container");
                sumsubInstanceRef.current = snsWebSdkInstance;
                setSdkLoaded(true);
                setSdkError(false);
            } catch (err) {
                console.error("WebSDK launch error:", err);
                setSdkError(true);
            }
        };

        if (window.snsWebSdk) {
            launchSdk();
            return;
        }

        document.querySelectorAll('script[src*="sumsub.com"]').forEach(el => el.remove());

        const script = document.createElement("script");
        script.src = "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
        script.async = true;
        script.onload = () => {
            launchSdk();
        };
        script.onerror = () => {
            setSdkError(true);
            setSdkLoaded(false);
        };
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        fetchKyc();
    }, []);

    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsModalOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);

        if (activeProvider === "metamap") {
            const script = loadMetaMapSdk();
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                try { document.body.removeChild(script); } catch {}
            };
        } else if (activeProvider === "sumsub") {
            initSumsubSdk();
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isModalOpen, activeProvider, loadMetaMapSdk, initSumsubSdk]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
            </div>
        );
    }

    const status = kycData?.status || "unverified";

    const clientId = process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID && process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID !== "change-me-in-gcp-trigger"
        ? process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID
        : "6a476c6475062151a6c42022";
    const flowId = process.env.NEXT_PUBLIC_METAMAP_FLOW_ID && process.env.NEXT_PUBLIC_METAMAP_FLOW_ID !== "change-me-in-gcp-trigger"
        ? process.env.NEXT_PUBLIC_METAMAP_FLOW_ID
        : "6a476c6486cc8d264d1a0a5f";

    return (
        <div className="space-y-8 text-zinc-100">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">KYC Identity Verification</h2>
                <p className="text-sm text-zinc-400">
                    Verify your identity to unlock full account features and compliance privileges.
                </p>
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-2xl flex items-start gap-3.5 border ${
                status === "verified" ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300" :
                status === "pending" ? "bg-amber-950/60 border-amber-500/30 text-amber-300" :
                status === "rejected" ? "bg-red-950/60 border-red-500/30 text-red-300" :
                "bg-zinc-900/90 border-zinc-800 text-zinc-300"
            }`}>
                {status === "verified" && <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />}
                {status === "pending" && <Loader2 className="w-5 h-5 text-amber-400 mt-0.5 animate-spin" />}
                {status === "rejected" && <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />}
                {status === "unverified" && <AlertTriangle className="w-5 h-5 text-zinc-400 mt-0.5" />}
                
                <div>
                    <h3 className="font-semibold capitalize text-base">Status: {status}</h3>
                    {status === "verified" && <p className="text-sm opacity-90">Your identity has been verified successfully.</p>}
                    {status === "pending" && <p className="text-sm opacity-90">Your verification documents are currently under review.</p>}
                    {status === "rejected" && (
                        <p className="text-sm opacity-90">
                            Verification rejected. Reason: {kycData?.rejection_reason || "Invalid or unreadable document."}
                        </p>
                    )}
                    {status === "unverified" && <p className="text-sm opacity-90">Complete the identity verification step below.</p>}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/50 text-red-300 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {(status === "unverified" || status === "rejected") ? (
                <div
                    className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 relative overflow-hidden text-center w-full"
                    style={{ background: "linear-gradient(180deg, #18181b 0%, #09090b 100%)", border: "1px solid rgba(198,156,46,0.25)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}
                >
                    {/* Glow Accents */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(198,156,46,0.1)" }} />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(198,156,46,0.1)" }} />

                    <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 z-10"
                        style={{ background: "rgba(198,156,46,0.15)", border: "1px solid rgba(198,156,46,0.3)", boxShadow: "0 10px 15px -3px rgba(198,156,46,0.1)" }}
                    >
                        <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#C69C2E" }} />
                    </div>

                    <div className="text-center space-y-2 max-w-md z-10 px-2">
                        <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                            Identity Verification Required
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                            Verify your profile to unlock unlimited trading, payouts, and full platform compliance.
                        </p>
                    </div>

                    {/* Launch Verification CTA Button */}
                    <div className="pt-2 z-10 w-full max-w-xs px-2 sm:px-4">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-3.5 sm:py-4 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                            style={{ background: "linear-gradient(90deg, #C69C2E, #D4AF37, #E6B83B)", color: "#09090b", boxShadow: "0 15px 25px -5px rgba(198,156,46,0.25)" }}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: "#09090b" }} />
                            <span className="truncate">Start Verification</span>
                        </Button>
                    </div>

                    {/* Full-Width Dark Theme Modal Overlay */}
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                            style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setIsModalOpen(false);
                            }}
                        >
                            <div
                                className="relative w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
                                style={{ background: "#09090b", color: "#ffffff", border: "1px solid rgba(198,156,46,0.3)" }}
                            >
                                
                                {/* Modal Header */}
                                <div
                                    className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 border-b border-zinc-800"
                                    style={{ background: "#18181b" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: "rgba(198,156,46,0.15)", border: "1px solid rgba(198,156,46,0.3)" }}
                                        >
                                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#C69C2E" }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-lg flex items-center gap-2 text-white">
                                                Identity Verification
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-full transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>

                                {/* Style Overrides for Sumsub WebSDK iFrame & Scrolling */}
                                <style>{`
                                    #sumsub-websdk-container {
                                        width: 100% !important;
                                        min-height: 720px !important;
                                        display: flex !important;
                                        flex-direction: column !important;
                                    }
                                    #sumsub-websdk-container iframe,
                                    #sumsub-websdk-container > div {
                                        width: 100% !important;
                                        min-height: 720px !important;
                                        flex: 1 1 auto !important;
                                        border: none !important;
                                        border-radius: 16px !important;
                                    }
                                `}</style>

                                {/* Modal Body Container - 100% Scrollable on Mobile & Touch devices */}
                                <div
                                    className="flex-1 overflow-y-auto p-2 sm:p-6 relative w-full h-full overscroll-contain"
                                    style={{ background: "#09090b", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                                >
                                    {!sdkLoaded && !sdkError && (
                                        <div
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 bg-[#09090b]/95"
                                        >
                                            <Loader2 className="w-9 h-9 animate-spin text-[#C69C2E]" />
                                            <p className="text-sm font-medium text-zinc-300">Initializing secure verification portal...</p>
                                        </div>
                                    )}

                                    {sdkError && (
                                        <div
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center bg-[#09090b]"
                                        >
                                            <AlertTriangle className="w-10 h-10 text-red-400" />
                                            <div>
                                                <h4 className="font-bold text-base text-white">Failed to load verification module</h4>
                                                <p className="text-sm mt-1 max-w-sm text-zinc-400">Please check your internet connection or try reloading the verification widget.</p>
                                            </div>
                                            <Button
                                                onClick={activeProvider === "sumsub" ? initSumsubSdk : loadMetaMapSdk}
                                                variant="outline"
                                                className="rounded-xl border-[#C69C2E] text-[#C69C2E]"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Retry Connection
                                            </Button>
                                        </div>
                                    )}

                                    {/* WebSDK Mount Container */}
                                    <div className="w-full flex-1 flex flex-col justify-start pb-6">
                                        {activeProvider === "sumsub" ? (
                                            <div
                                                id="sumsub-websdk-container"
                                                ref={sumsubContainerRef}
                                                className="w-full flex-1"
                                                style={{ width: "100%", minHeight: "720px", background: "#09090b", borderRadius: "16px" }}
                                            />
                                        ) : (
                                            <div ref={metamapRef} className="w-full flex justify-center py-6">
                                                <metamap-button
                                                    clientid={clientId}
                                                    flowid={flowId}
                                                    metadata={JSON.stringify({ userId })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-zinc-900/90 border border-zinc-800 p-4 sm:p-6 rounded-2xl">
                        <div>
                            <p className="text-sm text-zinc-400 mb-1">KYC Provider</p>
                            <p className="font-semibold text-white uppercase">
                                {kycData?.kyc_provider || activeProvider}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400 mb-1">Applicant / Verification ID</p>
                            <p className="font-semibold text-[#C69C2E] truncate">
                                {kycData?.sumsub_applicant_id || kycData?.metamap_verification_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400 mb-1">Inspection / Flow ID</p>
                            <p className="font-semibold text-white truncate">
                                {kycData?.sumsub_inspection_id || kycData?.metamap_flow_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-400 mb-1">Last Updated</p>
                            <p className="font-semibold text-white">
                                {kycData?.updated_at ? new Date(kycData.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


