"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Bell,
    Settings,
    Users,
    Car,
    FileCheck,
    MessageSquare,
    Wallet,
    Headset,
    TrendingUp,
    Menu,
    X,
    LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarLink {
    name: string;
    href: string;
    icon: any;
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuLinks: SidebarLink[] = [
        { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
        { name: "Notifications", href: "/admin/notifications", icon: Bell },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const userManagementLinks: SidebarLink[] = [
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Drivers", href: "/admin/drivers", icon: Car },
        { name: "KYC Verification", href: "/admin/kyc", icon: FileCheck },
        { name: "Driver Licenses", href: "/admin/drivers/licenses", icon: FileCheck },
    ];

    const othersLinks: SidebarLink[] = [
        { name: "All Negotiations", href: "/admin/negotiations", icon: MessageSquare },
        { name: "Escrows", href: "/admin/escrows", icon: Wallet },
        { name: "Transactions", href: "/admin/transactions", icon: TrendingUp },
        { name: "Payments", href: "/admin/payments", icon: Wallet },
        { name: "Support", href: "/admin/support", icon: Headset },
    ];

    const isLinkActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Sidebar Toggle Button exactly for mobile screens */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-3.5 left-4 z-50 bg-white border border-slate-100 p-2.5 rounded-xl text-slate-500 hover:text-slate-800 shadow-md hover:bg-slate-50 transition-all select-none"
            >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 transition-opacity backdrop-blur-sm"
                />
            )}

            {/* Sidebar Left Section - perfectly hidden on smaller screens */}
            <aside
                className={`w-64 border-r border-slate-100 bg-white h-full flex flex-col justify-between shrink-0 select-none fixed lg:static inset-y-0 left-0 z-40 transform lg:translate-x-0 transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-6">
                    {/* Brand Logo */}
                    <Link href="/admin/overview" className="flex items-center gap-2 mb-10 hover:scale-[1.02] transition-all">
                        <img src="/DGE logo.png" alt="DGE Logo" className="h-10 w-auto" />
                    </Link>

                    {/* Navigation Items */}
                    <nav className="space-y-7">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none block mb-3">
                                Menu
                            </span>
                            <div className="space-y-1.5">
                                {menuLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isLinkActive(link.href);
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[13px] transition-all select-none ${
                                                active
                                                    ? "bg-amber-50/50 text-[#b68512] border-l-2 border-[#b68512]"
                                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70"
                                            }`}
                                        >
                                            <Icon size={17} />
                                            <span>{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none block mb-3">
                                User Management
                            </span>
                            <div className="space-y-1.5">
                                {userManagementLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isLinkActive(link.href);
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[13px] transition-all select-none ${
                                                active
                                                    ? "bg-amber-50/50 text-[#b68512] border-l-2 border-[#b68512]"
                                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70"
                                            }`}
                                        >
                                            <Icon size={17} />
                                            <span>{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none block mb-3">
                                Others
                            </span>
                            <div className="space-y-1.5">
                                {othersLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = isLinkActive(link.href);
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[13px] transition-all select-none ${
                                                active
                                                    ? "bg-amber-50/50 text-[#b68512] border-l-2 border-[#b68512]"
                                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70"
                                            }`}
                                        >
                                            <Icon size={17} />
                                            <span>{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Logout Button at bottom */}
                <div className="p-6 border-t border-slate-50">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-[13px] text-red-500 hover:bg-red-50 transition-all select-none"
                    >
                        <LogOut size={17} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
