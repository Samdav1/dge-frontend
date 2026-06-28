"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBackendImageUrl } from "@/lib/imageUtils";
import FallbackImage from "@/components/ui/FallbackImage";

interface ServiceCardProps {
    id: string;
    title: string;
    description: string;
    price: string;
    image: string;
    category: string;
    type: "Onsite" | "Online";
    status?: string;
}

export function ServiceCard({
    id,
    title,
    description,
    price,
    image,
    category,
    type,
    status = "pending_review",
}: ServiceCardProps) {
    const getStatusStyles = (statusVal: string) => {
        const normalized = statusVal?.toLowerCase();
        switch (normalized) {
            case "approved":
            case "active":
                return {
                    label: "Approved",
                    classes: "bg-emerald-50 text-emerald-600 border border-emerald-100"
                };
            case "rejected":
                return {
                    label: "Rejected",
                    classes: "bg-red-50 text-red-600 border border-red-100"
                };
            case "draft":
                return {
                    label: "Draft",
                    classes: "bg-gray-50 text-gray-600 border border-gray-100"
                };
            case "pending_review":
            case "pending":
            default:
                return {
                    label: "Pending Approval",
                    classes: "bg-amber-50 text-amber-600 border border-amber-100"
                };
        }
    };

    const statusInfo = getStatusStyles(status);

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#C69C2E] hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <div className="relative h-40 md:h-48 rounded-xl overflow-hidden mb-4 shrink-0">
                <FallbackImage
                    src={getBackendImageUrl(image)}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold select-none ${statusInfo.classes}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${type === "Onsite" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                        }`}>
                        {type}
                    </span>
                </div>
                <span className="font-bold text-gray-900">{price}</span>
            </div>

            <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed flex-grow">
                {description}
            </p>

            <div className="mb-4">
                <p className="text-xs text-gray-500">
                    Category: <span className="text-gray-900 font-medium">{category}</span>
                </p>
            </div>

            <Link href={`/dashboard/my-jobs/${id}`} className="w-full">
                <Button
                    variant="outline"
                    className="w-full border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors h-11 md:h-10 rounded-xl font-medium"
                >
                    View Service
                </Button>
            </Link>
        </div>
    );
}
