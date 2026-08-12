import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, X } from "lucide-react";
import { getUserKyc, getProfile, getKycConfig, getSumsubToken } from "../actions";

interface KycData {
    status?: string;
    rejection_reason?: string;
    kyc_provider?: string;
    sumsub_applicant_id?: string;
    sumsub_inspection_id?: string;
    metamap_verification_id?: string;
    metamap_flow_id?: string;
    updated_at?: string;
}

export function KYCSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kycData, setKycData] = useState<KycData | null>(null);
    const [activeProvider, setActiveProvider] = useState<string>("sumsub");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [sdkError, setSdkError] = useState(false);

    const metamapRef = useRef<HTMLDivElement>(null);
    const sumsubContainerRef = useRef<HTMLDivElement>(null);
    const sumsubInstanceRef = useRef<unknown>(null);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefreshStatus = async () => {
        setIsRefreshing(true);
        await fetchKyc(false);
        setIsRefreshing(false);
    };

    // Fetch KYC status (showLoading = true for initial load, false for background sync)
    const fetchKyc = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        setError(null);
        
        try {
            const configRes = await getKycConfig();
            if (configRes.success && configRes.data?.active_provider) {
                setActiveProvider(configRes.data.active_provider);
            }

            await getProfile();
            
            const res = await getUserKyc();
            if (res.success && res.data) {
                setKycData(res.data);
            }
        } catch (err) {
            console.error("Error fetching KYC status:", err);
            if (showLoading) setError("Failed to load KYC configuration.");
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, []);

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

    // Preload SDK script on mount
    useEffect(() => {
        if (typeof window !== "undefined" && !window.snsWebSdk) {
            const script = document.createElement("script");
            script.src = "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    // Initialize Sumsub SDK without destroying container on step transitions
    const initSumsubSdk = useCallback(async () => {
        setSdkError(false);
        setSdkLoaded(false);

        const tokenRes = await getSumsubToken();
        if (!tokenRes.success || !tokenRes.data?.token) {
            setSdkError(true);
            setError(tokenRes.error || "Failed to generate verification token.");
            return;
        }

        const accessToken = tokenRes.data.token;

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
                    .onMessage((type: string, payload: unknown) => {
                        console.log("WebSDK event:", type, payload);
                        if (type === "idCheck.onApplicantStatusChanged" || type === "idCheck.onStepCompleted") {
                            // Silent background refetch - does NOT trigger full component unmount
                            fetchKyc(false);
                        }
                    })
                    .on("idCheck.onApplicantStatusChanged", (payload: unknown) => {
                        console.log("Status changed:", payload);
                        fetchKyc(false);
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
    }, [fetchKyc]);

    useEffect(() => {
        fetchKyc(true);
    }, [fetchKyc]);

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
    const clientId = process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID || "6a476c6475062151a6c42022";
    const flowId = process.env.NEXT_PUBLIC_METAMAP_FLOW_ID || "6a476c6486cc8d264d1a0a5f";
    const userId = "user-kyc";

    return (
        <div className="space-y-8 text-gray-900 dark:text-zinc-100">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">KYC Identity Verification</h2>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                    Verify your identity to unlock full account features and compliance privileges.
                </p>
            </div>

            {/* Status Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-colors ${
                status === "verified" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" :
                status === "pending" ? "bg-amber-50 dark:bg-[#C69C2E]/10 border-amber-200 dark:border-[#C69C2E]/30" :
                status === "rejected" ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" :
                "bg-gray-50 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800"
            }`}>
                <div className="flex items-start gap-3.5">
                    {status === "verified" && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />}
                    {status === "pending" && <Loader2 className="w-5 h-5 text-[#C69C2E] mt-0.5 animate-spin shrink-0" />}
                    {status === "rejected" && <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />}
                    {status === "unverified" && <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-zinc-400 mt-0.5 shrink-0" />}
                    
                    <div>
                        <h3 className={`font-bold capitalize text-base ${
                            status === "verified" ? "text-emerald-950 dark:text-white" :
                            status === "pending" ? "text-amber-950 dark:text-white" :
                            status === "rejected" ? "text-red-950 dark:text-white" :
                            "text-gray-900 dark:text-white"
                        }`}>
                            Status: {status}
                        </h3>
                        {status === "verified" && <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Your identity has been verified successfully.</p>}
                        {status === "pending" && <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Your verification documents are currently under review.</p>}
                        {status === "rejected" && (
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                Verification rejected. Reason: {kycData?.rejection_reason || "Invalid or unreadable document."}
                            </p>
                        )}
                        {status === "unverified" && <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Complete the identity verification step below.</p>}
                    </div>
                </div>

                <Button
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing}
                    variant="outline"
                    size="sm"
                    className="shrink-0 border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1C1C1C] hover:bg-gray-100 dark:hover:bg-[#252525] text-gray-700 dark:text-gray-200 font-semibold text-xs px-4 py-2 flex items-center gap-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C69C2E]" : ""}`} />
                    <span>Check Status</span>
                </Button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {status !== "verified" && (
                <div
                    className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl space-y-6 relative overflow-hidden text-center w-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-shadow"
                >
                    {/* Subtle Brand Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-[#C69C2E]/10" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-[#C69C2E]/10" />

                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 flex items-center justify-center shrink-0 z-10 mx-auto text-[#C69C2E] shadow-inner">
                        <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <div className="text-center space-y-2 max-w-md z-10 px-2">
                        <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {status === "pending"
                                ? "Verification In Progress"
                                : status === "rejected"
                                ? "Verification Needs Re-submission"
                                : "Identity Verification Required"}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
                            {status === "pending"
                                ? "Your verification is in progress. If you stopped halfway or need to complete document submission, click below to continue."
                                : status === "rejected"
                                ? "Your previous submission was rejected. Click below to re-submit your verification documents."
                                : "Verify your profile to unlock unlimited trading, payouts, and full platform compliance."}
                        </p>
                    </div>

                    {/* Launch Verification CTA Button */}
                    <div className="pt-2 z-10 w-full max-w-xs px-2 sm:px-4">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold text-xs sm:text-sm bg-[#C69C2E] hover:bg-[#b08b29] text-white shadow-lg shadow-[#C69C2E]/20 hover:shadow-[#C69C2E]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
                            <span className="truncate">
                                {status === "pending"
                                    ? "Continue Verification"
                                    : status === "rejected"
                                    ? "Re-verify Identity"
                                    : "Start Verification"}
                            </span>
                        </Button>
                    </div>

                    {/* Modal Overlay */}
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setIsModalOpen(false);
                            }}
                        >
                            <div
                                className="relative w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2A2A2A]"
                            >
                                {/* Modal Header */}
                                <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 flex items-center justify-center shrink-0 text-[#C69C2E]">
                                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                                                Identity Verification
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-xl transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Style Overrides for Sumsub WebSDK iFrame & Continuous Height */}
                                <style>{`
                                    #sumsub-websdk-container {
                                        width: 100% !important;
                                        min-height: 850px !important;
                                        display: flex !important;
                                        flex-direction: column !important;
                                    }
                                    #sumsub-websdk-container iframe,
                                    #sumsub-websdk-container > div {
                                        width: 100% !important;
                                        min-height: 850px !important;
                                        flex: 1 1 auto !important;
                                        border: none !important;
                                        border-radius: 16px !important;
                                    }
                                `}</style>

                                {/* Modal Body Container */}
                                <div
                                    className="flex-1 overflow-y-auto p-2 sm:p-6 relative w-full h-full overscroll-contain bg-white dark:bg-[#121212]"
                                    style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                                >
                                    {!sdkLoaded && !sdkError && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 bg-white/95 dark:bg-[#121212]/95">
                                            <Loader2 className="w-9 h-9 animate-spin text-[#C69C2E]" />
                                            <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Initializing secure verification portal...</p>
                                        </div>
                                    )}

                                    {sdkError && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center bg-white dark:bg-[#121212]">
                                            <AlertTriangle className="w-10 h-10 text-red-500" />
                                            <div>
                                                <h4 className="font-bold text-base text-gray-900 dark:text-white">Failed to load verification module</h4>
                                                <p className="text-sm mt-1 max-w-sm text-gray-500 dark:text-zinc-400">Please check your internet connection or try reloading the verification widget.</p>
                                            </div>
                                            <Button
                                                onClick={activeProvider === "sumsub" ? initSumsubSdk : loadMetaMapSdk}
                                                variant="outline"
                                                className="rounded-xl border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/10 font-semibold text-xs"
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
                                                className="w-full flex-1 rounded-2xl bg-white dark:bg-[#141414]"
                                                style={{ width: "100%", minHeight: "850px" }}
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
            )}

            {status === "verified" && (
                <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] p-6 rounded-3xl space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-[#2A2A2A] pb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center text-[#C69C2E]">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Verification Details</h3>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Confirmed compliance information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">KYC Provider</p>
                            <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">
                                {kycData?.kyc_provider || activeProvider}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Applicant / Verification ID</p>
                            <p className="font-bold text-[#C69C2E] truncate text-sm font-mono">
                                {kycData?.sumsub_applicant_id || kycData?.metamap_verification_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Inspection / Flow ID</p>
                            <p className="font-bold text-gray-900 dark:text-white truncate text-sm font-mono">
                                {kycData?.sumsub_inspection_id || kycData?.metamap_flow_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                            <p className="font-bold text-[#C69C2E] text-sm">
                                {kycData?.updated_at ? new Date(kycData.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
