"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSidebar from "../components/AdminSidebar";
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
    Search,
    ChevronDown,
    User,
    Lock,
    Folder,
    Shield,
    BellRing,
    Monitor,
    TrendingUp,
    Coins
} from "lucide-react";

// Sub-views imports
import PersonalDetailsView from "./components/PersonalDetailsView";
import SecurityView from "./components/SecurityView";
import NotificationsView from "./components/NotificationsView";
import SessionsView from "./components/SessionsView";
import TeamManagementView from "./components/TeamManagementView";
import AdminManagementView from "./components/AdminManagementView";
import RoleManagementView from "./components/RoleManagementView";
import CategoryManagementView from "./components/CategoryManagementView";
import PointsSettingsView from "./components/PointsSettingsView";

type ViewType = "main" | "personal-details" | "security" | "notifications" | "sessions" | "team" | "admin" | "category" | "roles" | "points";

export default function AdminSettingsPage() {
    const [activeView, setActiveView] = useState<ViewType>("main");

    const settingCards = [
        {
            id: "points",
            title: "DGE Points Settings",
            desc: "Configure point exchange rate (₦100 default) and signup bonuses.",
            icon: <Coins className="w-6 h-6 text-[#C69C2E]" />
        },
        {
            id: "personal-details",
            title: "Personal Details",
            desc: "Your name, contact details and other relevant information.",
            icon: <User className="w-6 h-6 text-blue-500" />
        },
        {
            id: "security",
            title: "Sign In & Security",
            desc: "These details are used to sign-in and access your account.",
            icon: <Lock className="w-6 h-6 text-amber-500" />
        },
        {
            id: "team",
            title: "Team Management",
            desc: "Create and manage Terms with specific permissions.",
            icon: <Users className="w-6 h-6 text-blue-500" />
        },
        {
            id: "admin",
            title: "Admin Management",
            desc: "Manage admin users, permissions, and access controls.",
            icon: <Shield className="w-6 h-6 text-cyan-600" />
        },
        {
            id: "category",
            title: "Manage Category",
            desc: "Manage Category , create , edit and delete",
            icon: <Folder className="w-6 h-6 text-orange-500" />
        },
        {
            id: "roles",
            title: "Role Management",
            desc: "Create and manage user roles with specific permissions.",
            icon: <Users className="w-6 h-6 text-blue-500" />
        },
        {
            id: "notifications",
            title: "Notifications",
            desc: "Manage your notification preferences and alert settings.",
            icon: <BellRing className="w-6 h-6 text-blue-500" />
        },
        {
            id: "sessions",
            title: "Active Sessions",
            desc: "Manage your active login sessions across all devices.",
            icon: <Monitor className="w-6 h-6 text-indigo-500" />
        }
    ];

    const breadcrumbLabel = {
        "main": "Settings",
        "personal-details": "Settings / Personal Details",
        "security": "Settings / Sign In & Security",
        "notifications": "Settings / Notification",
        "sessions": "Settings / Active Sessions",
        "team": "Settings / Team Management",
        "admin": "Settings / Admin Management",
        "category": "Settings / Manage Category",
        "roles": "Settings / Role Management",
        "points": "Settings / DGE Points Configuration"
    };

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none relative">
            <AdminSidebar />

            {/* Main Content Area Right Side */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                {/* Navbar Header Section */}
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[50%] xs:max-w-none">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <Settings size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-none select-none truncate">
                            {breadcrumbLabel[activeView]}
                        </h1>
                    </div>

                    {/* Admin profile */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 hover:bg-slate-50 cursor-pointer rounded-xl px-2 py-1.5 transition-colors select-none">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center font-semibold text-slate-700 text-sm border border-slate-200 shrink-0">
                                NC
                            </div>
                            <div className="flex flex-col select-none hidden sm:flex">
                                <span className="font-semibold text-xs text-slate-800 leading-tight">Nnaji Christian</span>
                                <span className="text-[10px] text-slate-400 font-medium">admin</span>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 ml-1 hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* Main Content Pane */}
                <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full">
                    {/* Search Field at top */}
                    <div className="relative w-full max-w-sm select-none">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder="Search Anything"
                            className="w-full h-10 pl-10 pr-4 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                        />
                    </div>

                    {activeView !== "main" && (
                        <button
                            onClick={() => setActiveView("main")}
                            className="self-start px-3 py-1 bg-white border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 select-none shadow-sm transition-all flex items-center gap-1 leading-none mb-2"
                        >
                            ← Back to Settings
                        </button>
                    )}

                    {/* View: Main Grid Dashboard */}
                    {activeView === "main" && (
                        <div className="space-y-6 flex-1 flex flex-col select-none animate-fade-in">
                            <div className="flex flex-col select-none leading-none">
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Account Settings</h1>
                                <p className="text-xs text-slate-400 font-medium mt-1 leading-none select-none">
                                    Manage account settings, preferences, and configurations
                                </p>
                            </div>

                            {/* Cards Grid of 8 options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none pt-2">
                                {settingCards.map((card) => (
                                    <div
                                        key={card.id}
                                        onClick={() => {
                                            setActiveView(card.id as ViewType);
                                        }}
                                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] h-[155px] flex flex-col justify-between hover:scale-[1.01] hover:shadow-[0_6px_28px_rgba(0,0,0,0.02)] transition-all cursor-pointer select-none"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center mb-3">
                                            {card.icon}
                                        </div>
                                        <div className="flex flex-col select-none leading-tight">
                                            <span className="font-bold text-sm text-slate-800 leading-tight">
                                                {card.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium mt-1 select-none leading-tight">
                                                {card.desc}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === "personal-details" && <PersonalDetailsView />}
                    {activeView === "security" && <SecurityView />}
                    {activeView === "notifications" && <NotificationsView />}
                    {activeView === "sessions" && <SessionsView />}
                    {activeView === "team" && <TeamManagementView />}
                    {activeView === "admin" && <AdminManagementView />}
                    {activeView === "roles" && <RoleManagementView />}
                    {activeView === "category" && <CategoryManagementView />}
                    {activeView === "points" && <PointsSettingsView />}
                </div>
            </main>
        </div>
    );
}
