"use client";

import React from "react";
import { PersonalSettings } from "./PersonalSettings";
import { PortfolioSettings } from "./PortfolioSettings";
import { KYCSettings } from "./KYCSettings";
import { DriverProfileForm } from "@/features/driving/components/DriverProfileForm";
import { ChevronRight, ShieldCheck, Car, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getUserKyc } from "../actions";
import { getDriverProfile } from "@/features/driving/actions";
import { toast } from "sonner";

export function ProfileLayout() {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get("tab") as 'personal' | 'portfolio' | 'kyc' | 'driver') || 'personal';
    const [activeTab, setActiveTab] = React.useState<'personal' | 'portfolio' | 'kyc' | 'driver'>(initialTab);

    const [isKycVerified, setIsKycVerified] = React.useState(false);
    const [isDriverVerified, setIsDriverVerified] = React.useState(false);
    const [isLoadingStatuses, setIsLoadingStatuses] = React.useState(true);

    const fetchStatuses = async () => {
        try {
            const kycRes = await getUserKyc();
            if (kycRes.success && kycRes.data && kycRes.data.status === 'verified') {
                setIsKycVerified(true);
            } else {
                setIsKycVerified(false);
            }
            const driverRes = await getDriverProfile();
            if (driverRes.success && driverRes.data && driverRes.data.license_status === 'verified') {
                setIsDriverVerified(true);
            } else {
                setIsDriverVerified(false);
            }
        } catch (e) {
            console.error("Failed to fetch kyc/driver status:", e);
        } finally {
            setIsLoadingStatuses(false);
        }
    };

    React.useEffect(() => {
        fetchStatuses();
    }, []);

    React.useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ['personal', 'portfolio', 'kyc', 'driver'].includes(tab)) {
            // Check KYC gate if trying to access driver directly
            if (tab === 'driver') {
                getUserKyc().then(kycRes => {
                    if (kycRes.success && kycRes.data && kycRes.data.status === 'verified') {
                        setActiveTab('driver');
                    } else {
                        toast.error("Identity verification (KYC) is required first.");
                        setActiveTab('kyc');
                    }
                });
            } else {
                setActiveTab(tab as any);
            }
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'personal' | 'portfolio' | 'kyc' | 'driver') => {
        if (tab === 'driver') {
            if (!isKycVerified) {
                toast.error("Identity verification (KYC) is required first. Taking you to KYC verification.");
                setActiveTab('kyc');
            } else {
                setActiveTab('driver');
            }
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col relative text-gray-900 dark:text-white">
            <div className="flex flex-row items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#C69C2E]">Profile</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start">
                {/* Sidebar Navigation */}
                <div 
                    className="w-full lg:w-80 flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 lg:sticky lg:top-24 self-start scrollbar-none [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <button
                        onClick={() => handleTabChange('personal')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${activeTab === 'personal'
                            ? 'bg-[#F5E6C8] dark:bg-[#C69C2E]/20 border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/50 dark:hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 lg:mb-1">Personal</h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Update your profile and contact settings.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'personal' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>

                    <button
                        onClick={() => handleTabChange('portfolio')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${activeTab === 'portfolio'
                            ? 'bg-[#F5E6C8] dark:bg-[#C69C2E]/20 border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/50 dark:hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 lg:mb-1">Portfolio Setup</h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Update your portfolio and setup your portfolio.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'portfolio' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>

                    <button
                        onClick={() => handleTabChange('kyc')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${activeTab === 'kyc'
                            ? 'bg-[#F5E6C8] dark:bg-[#C69C2E]/20 border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/50 dark:hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 lg:mb-1 flex items-center gap-1.5 sm:gap-2">
                                KYC Verification
                                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            </h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Verify your identity documents.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'kyc' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>

                    {isLoadingStatuses ? (
                        <div className="flex items-center justify-center p-4 lg:w-full">
                            <Loader2 className="w-5 h-5 text-[#C69C2E] animate-spin" />
                        </div>
                    ) : (
                        <button
                            onClick={() => handleTabChange('driver')}
                            className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${activeTab === 'driver'
                                ? 'bg-[#F5E6C8] dark:bg-[#C69C2E]/20 border-[#C69C2E] ring-1 ring-[#C69C2E]'
                                : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/50 dark:hover:border-[#C69C2E]/50'
                                }`}
                        >
                            <div className="flex flex-col items-start text-left">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5 lg:mb-1 flex items-center gap-1.5 sm:gap-2">
                                    {isDriverVerified ? "Driver Settings" : "Become a Driver"}
                                    <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C69C2E] flex-shrink-0" />
                                </h3>
                                <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                    {isDriverVerified ? "Update vehicle and license details." : "Register vehicle and accept rides."}
                                </p>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'driver' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'}`} />
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="w-full lg:flex-1 bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-4 sm:p-6 lg:p-8">
                    {activeTab === 'personal' && <PersonalSettings />}
                    {activeTab === 'portfolio' && <PortfolioSettings />}
                    {activeTab === 'kyc' && <KYCSettings />}
                    {activeTab === 'driver' && <DriverProfileForm />}
                </div>
            </div>
        </div>
    );
}

