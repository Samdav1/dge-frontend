"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./MobileSidebar";
import { useSession } from "next-auth/react";
import FallbackImage from "@/components/ui/FallbackImage";
import { getProfile } from "@/features/profile/actions";
import { FloatingRideWidget } from "@/features/driving/components/FloatingRideWidget";

export function DashboardHeader() {
    const { data: session } = useSession();
    const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await getProfile();
                if (res.success && res.data?.avatar_url) {
                    let avatar = res.data.avatar_url;
                    if (!avatar.startsWith("http")) {
                        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                        avatar = `${BASE_URL}${avatar}`;
                    }
                    setProfileAvatar(avatar);
                }
            } catch (err) {
                console.error("Failed to load header avatar:", err);
            }
        };
        fetchProfileData();
    }, [session]);

    return (
        <header className="h-16 md:h-20 bg-white dark:bg-[#0D0D0D] border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
            {/* Left section: Sidebar toggle & search */}
            <div className="flex items-center gap-4 flex-1">
                <MobileSidebar />
                <div className="w-full max-w-md hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <Input
                            placeholder="Search"
                            className="pl-10 h-10 bg-gray-50 dark:bg-[#1A1A1A] border-none rounded-full text-sm w-full dark:text-white dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>
            </div>

            {/* Middle section: Sleek Dynamic Island Ride widget */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <FloatingRideWidget />
            </div>

            {/* Right section: Notifications & User profile */}
            <div className="flex items-center gap-3 md:gap-6 ml-4 z-10">
                <NotificationBell />

                <Link href="/dashboard/profile" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-[#1A1A1A] rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[#C69C2E]/40 transition-all duration-200">
                        <FallbackImage
                            src={profileAvatar || session?.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"}
                            alt={session?.user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-sm hidden md:block">
                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#C69C2E] transition-colors">{session?.user?.name || "Loading..."}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || "loading..."}</p>
                    </div>
                </Link>
            </div>
        </header>
    );
}
