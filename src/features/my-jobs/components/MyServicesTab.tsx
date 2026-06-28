"use client";

import React from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "./ServiceCard";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { useMyServices } from "../hooks/useMyJobs";

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    discount?: boolean;
    discount_percent?: number;
    type: string;
    image?: string;
    status: string;
    categories: { id: string; name: string }[];
}

interface MyServicesTabProps {
    onCreateService: () => void;
}

export function MyServicesTab({ onCreateService }: MyServicesTabProps) {
    const { data: services, isLoading, error, refetch } = useMyServices();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-[#C69C2E]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-8 md:py-20 bg-white rounded-2xl">
                <p className="text-red-500 text-center mb-4">{(error as Error).message || "Failed to fetch services"}</p>
                <Button onClick={() => refetch()} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    if (!services || services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 md:py-20 bg-white rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No services yet
                </h3>

                <p className="text-gray-500 text-center mb-8 max-w-sm px-4">
                    You haven't created any services yet click the <span className="text-[#C69C2E] font-medium">"Create Service"</span> button to create a service
                </p>

                <Button
                    onClick={onCreateService}
                    className="bg-white text-[#C69C2E] border border-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors px-8 py-2 h-auto"
                >
                    + Create Service
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {services.map((service: Service) => (
                <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.name}
                    description={service.description}
                    price={`₦${service.price.toLocaleString()}`}
                    image={getBackendImageUrl(service.image)}
                    category={service.categories[0]?.name || "Uncategorized"}
                    type={service.type === "online" ? "Online" : "Onsite"}
                    status={service.status}
                />
            ))}
        </div>
    );
}
