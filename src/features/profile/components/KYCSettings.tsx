import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { getUserKyc, getProfile } from "../actions";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "metamap-button": any;
        }
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "metamap-button": any;
        }
    }
}


export function KYCSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kycData, setKycData] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchKyc = async () => {
        setIsLoading(true);
        setError(null);
        
        const profileRes = await getProfile();
        if (profileRes.success && profileRes.data) {
            setUserId(profileRes.data.user_id);
        }
        
        const res = await getUserKyc();
        if (res.success && res.data) {
            setKycData(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchKyc();

        // Load MetaMap Button SDK
        const script = document.createElement("script");
        script.src = "https://web-button.metamap.com/button.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
            </div>
        );
    }

    const status = kycData?.status || "unverified";

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">KYC Verification</h2>
                <p className="text-sm text-gray-500">
                    Verify your identity via MetaMap to unlock all features on the platform.
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
                    {status === "verified" && <p className="text-sm opacity-90">Your identity has been verified.</p>}
                    {status === "pending" && <p className="text-sm opacity-90">Your MetaMap verification is under review.</p>}
                    {status === "rejected" && (
                        <p className="text-sm opacity-90">
                            Your verification was rejected. Reason: {kycData?.rejection_reason || "Invalid documents."}
                        </p>
                    )}
                    {status === "unverified" && <p className="text-sm opacity-90">Please start the MetaMap verification flow below.</p>}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {(status === "unverified" || status === "rejected") ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                    <p className="text-sm text-gray-500 text-center">
                        Click the button below to verify your identity. You will need a valid government-issued ID.
                    </p>
                    {/* MetaMap Web Button */}
                    <div className="w-full flex justify-center">
                        <metamap-button
                            clientid={process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID || "65893a7d2c3e1e001b6e8a4a"}
                            flowid={process.env.NEXT_PUBLIC_METAMAP_FLOW_ID || "65893a7d2c3e1e001b6e8a4b"}
                            metadata={JSON.stringify({ userId })}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Verification ID</p>
                            <p className="font-semibold text-gray-900 truncate">
                                {kycData?.metamap_verification_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Verification Flow</p>
                            <p className="font-semibold text-gray-900 truncate">
                                {kycData?.metamap_flow_id || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Verified On</p>
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
