"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    Briefcase,
    ClipboardList,
    MessageSquare,
    Wallet,
    Car,
    Mail,
    User,
    HeadphonesIcon,
    LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useChatContext } from "@/providers/ChatProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const MENU_ITEMS = [
    { icon: LayoutGrid, label: "Ecosystem", href: "/dashboard/marketplace" },
    { icon: Briefcase, label: "Job Board", href: "/dashboard/job-board" },
    { icon: ClipboardList, label: "My Jobs", href: "/dashboard/my-jobs" },
    { icon: MessageSquare, label: "Negotiation", href: "/dashboard/negotiation" },
    { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
    { icon: Car, label: "Driving", href: "/dashboard/driving" },
    { icon: Mail, label: "Inbox", href: "/dashboard/inbox" },
    { icon: User, label: "Profile & Setting", href: "/dashboard/profile" },
    { icon: HeadphonesIcon, label: "Support", href: "/dashboard/support" },
];


interface DashboardSidebarProps {
    mobile?: boolean;
}

export function DashboardSidebar({ mobile }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { unreadRideRequests } = useChatContext();

    const baseClasses = "bg-white dark:bg-[#0D0D0D] border-r border-gray-100 dark:border-[#2A2A2A] h-screen flex flex-col";
    const desktopClasses = "fixed left-0 top-0 w-64 z-30 hidden lg:flex";
    const mobileClasses = "w-full";

    return (
        <aside className={mobile ? `${baseClasses} ${mobileClasses}` : `${baseClasses} ${desktopClasses}`}>
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/DGE logo.png" alt="DGE Logo" className="h-10 w-auto" />
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${isActive
                                ? "bg-[#C69C2E] text-white shadow-md"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`} />
                                {item.label}
                            </div>
                            {item.label === "Driving" && unreadRideRequests > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadRideRequests}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-[#2A2A2A] space-y-2">
                <ThemeToggle />
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <LogOut className="w-5 h-5 text-red-600" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
