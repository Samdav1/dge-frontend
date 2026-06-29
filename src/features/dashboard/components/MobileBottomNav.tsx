"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, Wallet, ClipboardList, Mail } from "lucide-react";
import { useChatContext } from "@/providers/ChatProvider";

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "Ecosystem", href: "/dashboard/marketplace" },
    { icon: ClipboardList, label: "My Jobs", href: "/dashboard/my-jobs" },
    { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
    { icon: Briefcase, label: "Posted Jobs", href: "/dashboard/job-board" },
    { icon: Mail, label: "Inbox", href: "/dashboard/inbox" },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const unreadCount = 0; // Default or fetched from local/global state if available later

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            {/* Frosted glass background with upward shadow and gold border */}
            <div className="absolute inset-0 bg-white/80 dark:bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#C69C2E]/40 shadow-[0_-4px_20px_rgba(198,156,46,0.12)]" />
            
            <div className="relative flex items-center justify-around px-2 py-2 safe-area-pb">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const isWallet = item.label === "Wallet";
                    const isInbox = item.label === "Inbox";

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 min-w-[56px] ${
                                isActive
                                    ? "text-[#C69C2E]"
                                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white active:scale-90"
                            }`}
                        >
                            {/* Active indicator glowing gold line */}
                            {isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#C69C2E] to-transparent shadow-[0_0_8px_#C69C2E]" />
                            )}

                            {/* Icon container */}
                            <div className="relative">
                                {isWallet && isActive ? (
                                    <div className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-br from-[#C69C2E] to-[#a37e20] flex items-center justify-center shadow-lg shadow-[#C69C2E]/30 border-4 border-white dark:border-[#0D0D0D]">
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                ) : (
                                    <item.icon className={`w-5 h-5 transition-all duration-200 ${
                                        isActive ? "scale-110" : ""
                                    }`} />
                                )}

                                {/* Inbox unread badge */}
                                {isInbox && unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-bold leading-tight transition-all duration-200 ${
                                isActive ? "text-[#C69C2E]" : "text-gray-400 dark:text-gray-500"
                            } ${isWallet && isActive ? "-mt-0.5" : ""}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
