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

    // Load Sumsub SDK & Initialize Container
    const initSumsubSdk = useCallback(async () => {
        setSdkError(false);
        setSdkLoaded(false);

        const tokenRes = await getSumsubToken();
        if (!tokenRes.success || !tokenRes.data?.token) {
            setSdkError(true);
            setError(tokenRes.error || "Failed to generate Sumsub access token.");
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
                    .withConf({ lang: "en" })
                    .withOptions({ addViewportTag: false, adaptIframeHeight: true })
                    .onMessage((type: string, payload: any) => {
                        console.log("Sumsub WebSDK event:", type, payload);
                        if (type === "idCheck.onApplicantStatusChanged" || type === "idCheck.onStepCompleted") {
                            fetchKyc();
                        }
                    })
                    .on("idCheck.onApplicantStatusChanged", (payload: any) => {
                        console.log("Sumsub status changed:", payload);
                        fetchKyc();
                    })
                    .build();

                snsWebSdkInstance.launch("#sumsub-websdk-container");
                sumsubInstanceRef.current = snsWebSdkInstance;
                setSdkLoaded(true);
                setSdkError(false);
            } catch (err) {
                console.error("Sumsub launch error:", err);
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
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">KYC Identity Verification</h2>
                <p className="text-sm text-gray-500">
                    Verify your identity via {activeProvider === "sumsub" ? "Sumsub" : "MetaMap"} to unlock full account features and compliance privileges.
                </p>
            </div>

            {/* Status Banner */}
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                status === "verified" ? "bg-green-50 border-green-200 text-green-800" :
                status === "pending" ? "bg-amber-50 border-amber-200 text-amber-800" :
                status === "rejected" ? "bg-red-50 border-red-200 text-red-800" :
                "bg-gray-50 border-gray-200 text-gray-800"
            }`}>
                {status === "verified" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                {status === "pending" && <Loader2 className="w-5 h-5 text-amber-500 mt-0.5 animate-spin" />}
                {status === "rejected" && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                {status === "unverified" && <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />}
                
                <div>
                    <h3 className="font-semibold capitalize">Status: {status}</h3>
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
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {(status === "unverified" || status === "rejected") ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50/50 to-white border border-gray-200/80 rounded-2xl space-y-6 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-[#C69C2E]/10 border border-[#C69C2E]/20 flex items-center justify-center shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-[#C69C2E]" />
                    </div>

                    <div className="text-center space-y-2 max-w-lg">
                        <h3 className="text-xl font-bold text-gray-900">
                            Identity Verification Required
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Verify your profile via {activeProvider === "sumsub" ? "Sumsub Secured KYC" : "MetaMap Verification"} to unlock unlimited trading, payouts, and full platform compliance.
                        </p>
                    </div>

                    {/* Launch Verification CTA Button */}
                    <div className="pt-2">
                        {activeProvider === "sumsub" ? (
                            <Button
                                onClick={() => {
                                    setIsModalOpen(true);
                                    initSumsubSdk();
                                }}
                                className="px-8 py-6 rounded-xl bg-gradient-to-r from-[#C69C2E] to-[#E6B83B] hover:from-[#b08b28] hover:to-[#C69C2E] text-white font-semibold text-base shadow-lg shadow-[#C69C2E]/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Start Sumsub Verification
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-6 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Start MetaMap Verification
                            </Button>
                        )}
                    </div>

                    {/* Full-Width Responsive Modal Overlay */}
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setIsModalOpen(false);
                            }}
                        >
                            <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
                                
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#C69C2E]/10 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-[#C69C2E]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                                                Identity Verification
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C69C2E]/10 text-[#C69C2E] font-medium border border-[#C69C2E]/20 capitalize">
                                                    {activeProvider}
                                                </span>
                                            </h3>
                                            <p className="text-xs text-gray-500">Secured 256-bit encrypted KYC verification</p>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Body Container */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-[480px] sm:min-h-[560px] flex flex-col items-center justify-center">
                                    {!sdkLoaded && !sdkError && (
                                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                                            <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
                                            <p className="text-sm font-medium text-gray-600">Initializing {activeProvider === "sumsub" ? "Sumsub" : "MetaMap"} secure portal...</p>
                                        </div>
                                    )}

                                    {sdkError && (
                                        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                                            <AlertTriangle className="w-10 h-10 text-red-500" />
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-base">Failed to load verification module</h4>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm">Please check your internet connection or try reloading the verification widget.</p>
                                            </div>
                                            <Button
                                                onClick={activeProvider === "sumsub" ? initSumsubSdk : loadMetaMapSdk}
                                                variant="outline"
                                                className="rounded-xl border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/10"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Retry Connection
                                            </Button>
                                        </div>
                                    )}

                                    {/* WebSDK Mount Container */}
                                    <div className={`w-full flex-1 flex justify-center ${(!sdkLoaded && !sdkError) ? 'hidden' : ''}`}>
                                        {activeProvider === "sumsub" ? (
                                            <div id="sumsub-websdk-container" ref={sumsubContainerRef} className="w-full min-h-[450px] sm:min-h-[520px]" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">KYC Provider</p>
                            <p className="font-semibold text-gray-900 uppercase">
                                {kycData?.kyc_provider || activeProvider}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Applicant / Verification ID</p>
                            <p className="font-semibold text-gray-900 truncate">
                                {kycData?.sumsub_applicant_id || kycData?.metamap_verification_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Inspection / Flow ID</p>
                            <p className="font-semibold text-gray-900 truncate">
                                {kycData?.sumsub_inspection_id || kycData?.metamap_flow_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                            <p className="font-semibold text-gray-900">
                                {kycData?.updated_at ? new Date(kycData.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


