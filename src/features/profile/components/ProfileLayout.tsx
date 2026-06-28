"use client";

import React from "react";
import { PersonalSettings } from "./PersonalSettings";
import { PortfolioSettings } from "./PortfolioSettings";
import { KYCSettings } from "./KYCSettings";
import { ChevronRight, ShieldCheck } from "lucide-react";

export function ProfileLayout() {
    const [activeTab, setActiveTab] = React.useState<'personal' | 'portfolio' | 'kyc'>('personal');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col relative">
            <div className="flex flex-row items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
                <div className="text-xs text-gray-500 flex items-center gap-2">
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
                        onClick={() => setActiveTab('personal')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group ${activeTab === 'personal'
                            ? 'bg-[#F5E6C8] border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white border-gray-100 hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 lg:mb-1">Personal</h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">Update your profile and contact settings.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'personal' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>

                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group ${activeTab === 'portfolio'
                            ? 'bg-[#F5E6C8] border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white border-gray-100 hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 lg:mb-1">Portfolio Setup</h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">Update your portfolio and setup your portfolio.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'portfolio' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>

                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`flex-1 min-w-[140px] sm:min-w-[180px] lg:w-full text-left p-3.5 lg:p-4 rounded-xl border transition-all flex items-center justify-between group ${activeTab === 'kyc'
                            ? 'bg-[#F5E6C8] border-[#C69C2E] ring-1 ring-[#C69C2E]'
                            : 'bg-white border-gray-100 hover:border-[#C69C2E]/50'
                            }`}
                    >
                        <div className="flex flex-col items-start text-left">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 lg:mb-1 flex items-center gap-1.5 sm:gap-2">
                                KYC Verification
                                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            </h3>
                            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">Verify your identity documents.</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors hidden lg:block ${activeTab === 'kyc' ? 'text-[#C69C2E]' : 'text-gray-400 group-hover:text-[#C69C2E]'
                            }`} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="w-full lg:flex-1 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                    {activeTab === 'personal' && <PersonalSettings />}
                    {activeTab === 'portfolio' && <PortfolioSettings />}
                    {activeTab === 'kyc' && <KYCSettings />}
                </div>
            </div>
        </div>
    );
}
