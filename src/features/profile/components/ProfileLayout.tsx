"use client";

import React from "react";
import { PersonalSettings } from "./PersonalSettings";
import { PortfolioSettings } from "./PortfolioSettings";
import { KYCSettings } from "./KYCSettings";
import { DriverProfileForm } from "@/features/driving/components/DriverProfileForm";
import { ChevronRight, ShieldCheck, Car, Loader2, User, Briefcase } from "lucide-react";
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
                setActiveTab(tab as 'personal' | 'portfolio' | 'kyc' | 'driver');
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

    const navTabs = [
        {
            id: 'personal' as const,
            title: 'Personal Details',
            shortTitle: 'Profile',
            description: 'Update your personal profile, bio, and contact info.',
            icon: User,
            activeBg: 'bg-[#C69C2E] text-white',
        },
        {
            id: 'portfolio' as const,
            title: 'Portfolio Setup',
            shortTitle: 'Portfolio',
            description: 'Update your work portfolio and social media links.',
            icon: Briefcase,
            activeBg: 'bg-[#C69C2E] text-white',
        },
        {
            id: 'kyc' as const,
            title: 'KYC Verification',
            shortTitle: 'KYC',
            description: 'Verify your identity documents & legal status.',
            icon: ShieldCheck,
            activeBg: 'bg-emerald-600 text-white',
        },
        {
            id: 'driver' as const,
            title: isDriverVerified ? 'Driver Settings' : 'Become a Driver',
            shortTitle: isDriverVerified ? 'Driver' : 'Driver',
            description: isDriverVerified ? 'Manage your vehicle details and license.' : 'Register your vehicle to accept rides.',
            icon: Car,
            activeBg: 'bg-[#C69C2E] text-white',
        },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col relative text-gray-900 dark:text-white">
            <div className="flex flex-row items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#C69C2E] font-medium">Profile</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start">
                {/* Sidebar Navigation - Single Inline Row on Mobile */}
                <div className="w-full lg:w-80 flex flex-row lg:flex-col gap-1.5 sm:gap-2.5 lg:gap-4 lg:sticky lg:top-24 self-start">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        if (tab.id === 'driver' && isLoadingStatuses) {
                            return (
                                <div key={tab.id} className="flex-1 min-w-0 p-2 lg:p-4 rounded-xl lg:rounded-2xl border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] flex items-center justify-center min-h-[42px] lg:min-h-[52px] lg:w-full">
                                    <Loader2 className="w-4 h-4 text-[#C69C2E] animate-spin" />
                                </div>
                            );
                        }

                        return (
                            <div key={tab.id} className="relative group/tab flex-1 min-w-0 lg:w-full">
                                {/* Hover Tooltip Modal / Popover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover/tab:flex flex-col items-center z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-gray-900/95 dark:bg-black/95 backdrop-blur-md text-white text-xs p-3 rounded-2xl shadow-2xl border border-white/10 w-52 sm:w-60 text-center">
                                        <div className="flex items-center justify-center gap-1.5 font-bold text-[#C69C2E] mb-1">
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{tab.title}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 font-normal leading-relaxed">{tab.description}</p>
                                    </div>
                                    <div className="w-2.5 h-2.5 bg-gray-900/95 dark:bg-black/95 rotate-45 -mt-1.5 border-r border-b border-white/10" />
                                </div>

                                <button
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full text-left p-1 sm:p-2.5 lg:p-4 rounded-xl lg:rounded-2xl border transition-all duration-200 flex items-center justify-center sm:justify-between group cursor-pointer ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#F5E6C8]/90 via-[#F5E6C8]/60 to-[#F5E6C8]/30 dark:from-[#C69C2E]/25 dark:via-[#C69C2E]/15 dark:to-[#C69C2E]/5 border-[#C69C2E] ring-1 sm:ring-2 ring-[#C69C2E]/40 shadow-md shadow-[#C69C2E]/10'
                                            : 'bg-white dark:bg-[#121212] border-gray-100 dark:border-[#2A2A2A] hover:border-[#C69C2E]/50 dark:hover:border-[#C69C2E]/50 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3.5 min-w-0 w-full justify-center sm:justify-start">
                                        <div className={`w-5.5 h-5.5 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                                            isActive
                                                ? `${tab.activeBg} shadow-sm shadow-[#C69C2E]/20 scale-105`
                                                : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 group-hover/tab:text-[#C69C2E] group-hover/tab:bg-[#C69C2E]/10'
                                        }`}>
                                            <Icon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        </div>
                                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                                            <h3 className="text-[9px] min-[360px]:text-[10px] sm:text-xs lg:text-sm font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap leading-none">
                                                <span className="sm:hidden">{tab.shortTitle}</span>
                                                <span className="hidden sm:inline">{tab.title}</span>
                                            </h3>
                                            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 hidden lg:block whitespace-nowrap truncate w-full mt-0.5">
                                                {tab.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 hidden lg:block shrink-0 ${
                                        isActive ? 'text-[#C69C2E] translate-x-0.5' : 'text-gray-400 group-hover/tab:text-[#C69C2E] group-hover/tab:translate-x-0.5'
                                    }`} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="w-full lg:flex-1 bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-4 sm:p-6 lg:p-8 shadow-sm">
                    {activeTab === 'personal' && <PersonalSettings />}
                    {activeTab === 'portfolio' && <PortfolioSettings />}
                    {activeTab === 'kyc' && <KYCSettings />}
                    {activeTab === 'driver' && <DriverProfileForm />}
                </div>
            </div>
        </div>
    );
}

