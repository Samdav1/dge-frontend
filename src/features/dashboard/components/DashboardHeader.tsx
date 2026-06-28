"use client";

import { NotificationBell } from "@/components/ui/NotificationBell";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./MobileSidebar";
import { useSession } from "next-auth/react";
import FallbackImage from "@/components/ui/FallbackImage";

export function DashboardHeader() {
    const { data: session } = useSession();

    return (
        <header className="h-16 md:h-20 bg-white dark:bg-[#0D0D0D] border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
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

            <div className="flex items-center gap-3 md:gap-6 ml-4">
                <NotificationBell />

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                        <FallbackImage
                            src={session?.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"}
                            alt={session?.user?.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-sm hidden md:block">
                        <p className="font-medium text-gray-900 dark:text-white">{session?.user?.name || "Loading..."}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email || "loading..."}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
