"use client";

import React from "react";
import { NegotiationList } from "./NegotiationList";

export function NegotiationLayout() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Negotiations</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Manage and track your active service contracts and price agreements.
                    </p>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#C69C2E] font-bold">Negotiations</span>
                </div>
            </div>

            <NegotiationList />
        </div>
    );
}
