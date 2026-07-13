"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MyServicesTab } from "./MyServicesTab";
import { useKycGate } from "@/hooks/useKycGate";
import { OngoingJobsTab } from "./OngoingJobsTab";
import { SubmittedJobsTab } from "./SubmittedJobsTab";
import { PostedJobsTab } from "./PostedJobsTab";
import { CreateServiceModal } from "./CreateServiceModal";

type Tab = "services" | "ongoing" | "submitted" | "posted";

export function MyJobsLayout() {
    const [activeTab, setActiveTab] = useState<Tab>("services");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { checkKyc, KycGateModal } = useKycGate();

    const tabs: { id: Tab; label: string }[] = [
        { id: "services", label: "My Services" },
        { id: "ongoing", label: "Ongoing Jobs" },
        { id: "submitted", label: "Submitted Jobs" },
        { id: "posted", label: "Posted Jobs" },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>

                <Button
                    onClick={() => checkKyc(() => setIsCreateModalOpen(true), "create services")}
                    className="bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-xl px-6 w-full md:w-auto"
                >
                    + Create Services
                </Button>
            </div>

            <div className="bg-white rounded-2xl p-1 mb-6 flex overflow-x-auto scrollbar-hide border border-gray-100 max-w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                            activeTab === tab.id
                                ? "bg-[#C69C2E] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === "services" && (
                    <MyServicesTab onCreateService={() => checkKyc(() => setIsCreateModalOpen(true), "create services")} />
                )}
                {activeTab === "ongoing" && <OngoingJobsTab />}
                {activeTab === "submitted" && <SubmittedJobsTab />}
                {activeTab === "posted" && <PostedJobsTab />}
            </div>

            <CreateServiceModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
            {KycGateModal}
        </div>
    );
}

