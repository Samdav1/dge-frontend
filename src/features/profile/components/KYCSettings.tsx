import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { getUserKyc, getProfile, getKycConfig, getSumsubToken } from "../actions";

export function KYCSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kycData, setKycData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [activeProvider, setActiveProvider] = useState<string>("sumsub");

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
                    .onStatusChange((newStatus: string) => {
                        console.log("Sumsub status changed:", newStatus);
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
        script.src = "https://static.sumsub.com/onis/websdk/v1/sns-websdk-builder.js";
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
        if (isLoading) return;
        const status = kycData?.status || "unverified";
        if (status === "verified") return;

        if (activeProvider === "metamap") {
            const script = loadMetaMapSdk();
            return () => {
                try { document.body.removeChild(script); } catch {}
            };
        } else if (activeProvider === "sumsub") {
            initSumsubSdk();
        }
    }, [activeProvider, isLoading, kycData?.status, loadMetaMapSdk, initSumsubSdk]);

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
                <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-[#C69C2E]/10 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-[#C69C2E]" />
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            Verify via {activeProvider === "sumsub" ? "Sumsub Identity Verification" : "MetaMap Verification"}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md">
                            Follow the on-screen prompts to submit your government-issued ID and selfie verification.
                        </p>
                    </div>

                    {/* Active Provider Container */}
                    {activeProvider === "sumsub" ? (
                        <div className="w-full min-h-[400px]">
                            <div id="sumsub-websdk-container" ref={sumsubContainerRef} className="w-full flex justify-center min-h-[400px]" />
                        </div>
                    ) : (
                        <div ref={metamapRef} className="w-full flex justify-center py-4">
                            <metamap-button
                                clientid={clientId}
                                flowid={flowId}
                                metadata={JSON.stringify({ userId })}
                            />
                        </div>
                    )}

                    {!sdkLoaded && !sdkError && (
                        <div className="flex flex-col items-center gap-2 py-4">
                            <Loader2 className="w-5 h-5 text-[#C69C2E] animate-spin" />
                            <p className="text-xs text-gray-400">Loading {activeProvider === "sumsub" ? "Sumsub" : "MetaMap"} verification module...</p>
                        </div>
                    )}

                    {sdkError && (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <p className="text-sm text-red-500">Failed to load {activeProvider} verification widget.</p>
                            <Button
                                onClick={activeProvider === "sumsub" ? initSumsubSdk : loadMetaMapSdk}
                                variant="outline"
                                className="rounded-xl border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E]/5"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Loading
                            </Button>
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


