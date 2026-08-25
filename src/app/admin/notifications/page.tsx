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
    Send,
    MoreHorizontal,
    ChevronDown
} from "lucide-react";

import { useEffect } from "react";

export default function AdminNotificationsPage() {
    const [selectedTab, setSelectedTab] = useState<"compose" | "sent">("compose");
    const [deliveryChannel, setDeliveryChannel] = useState<"Email" | "Push">("Push");
    const [recipientsType, setRecipientsType] = useState<"All" | "Active" | "Verified" | "Pending" | "Inactive">("Verified");

    const [msgTitle, setMsgTitle] = useState("");
    const [msgBody, setMsgBody] = useState("");

    const [notifications, setNotifications] = useState<any[]>([]);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    async function handleDeleteNotification(notifId: string) {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        try {
            const res = await fetch(`/api/admin/notifications?notification_id=${notifId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                alert("Notification deleted successfully");
                fetchNotifications();
            } else {
                alert("Failed to delete notification");
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    }

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/admin/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const sentNotifications = [
        {
            title: "The Notification",
            subtitle: "Thank you for joining our platform. Complete your KYC to...",
            recipients: "All New Users",
            type: "Email",
            sentAt: "09/03/2025 . 09:34PM",
            status: "DELIVERED"
        },
        {
            title: "The Alert",
            subtitle: "Your password has been successfully changed.",
            recipients: "Verified Users",
            type: "Push Notification",
            sentAt: "09/04/2025 . 10:00AM",
            status: "DELIVERED"
        },
        {
            title: "The Success Message",
            subtitle: "Your profile has been updated successfully.",
            recipients: "All Users",
            type: "Email",
            sentAt: "09/05/2025 . 11:15PM",
            status: "PENDING"
        },
        {
            title: "The Reminder",
            subtitle: "Don't forget to verify your email address.",
            recipients: "Active Users",
            type: "Push Notification",
            sentAt: "09/06/2025 . 12:45PM",
            status: "DELIVERED"
        },
        {
            title: "The Update",
            subtitle: "We have updated our privacy policy. Please review it.",
            recipients: "Inactive Users",
            type: "Email",
            sentAt: "09/07/2025 . 01:30AM",
            status: "DELIVERED"
        },
        {
            title: "The Success Message",
            subtitle: "Your profile has been updated successfully.",
            recipients: "All New Users",
            type: "Push Notification",
            sentAt: "09/08/2025 . 09:00PM",
            status: "PENDING"
        },
        {
            title: "The Warning",
            subtitle: "Your account will be suspended after three failed login atte...",
            recipients: "All Users",
            type: "Email",
            sentAt: "09/09/2025 . 02:20PM",
            status: "DELIVERED"
        },
        {
            title: "The Event Notification",
            subtitle: "You have an upcoming event scheduled for next week.",
            recipients: "Active Users",
            type: "Push Notification",
            sentAt: "09/10/2025 . 03:10AM",
            status: "PENDING"
        },
        {
            title: "The Success Message",
            subtitle: "Your profile has been updated successfully.",
            recipients: "All New Users",
            type: "Email",
            sentAt: "09/11/2025 . 04:50PM",
            status: "DELIVERED"
        },
        {
            title: "The Feedback Request",
            subtitle: "We value your feedback! Please take a moment to fill out thi...",
            recipients: "Verified Users",
            type: "Push Notification",
            sentAt: "09/12/2025 . 05:30AM",
            status: "FAILED"
        },
        {
            title: "The System Alert",
            subtitle: "Maintenance will occur on Saturday from 2 AM to 4 AM.",
            recipients: "All Users",
            type: "Email",
            sentAt: "09/03/2025 . 09:34PM",
            status: "DELIVERED"
        }
    ];

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden select-none">
            <AdminSidebar />

            {/* Main Content Area Right Side */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafafa] select-none">
                {/* Navbar Header Section */}
                <header className="h-16 pl-16 pr-4 lg:px-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2 max-w-[50%] xs:max-w-none">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b68512] shrink-0">
                            <Bell size={18} />
                        </div>
                        <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate select-none">Notification</h1>
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

                {/* Main Notification Content Pane */}
                <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none max-w-[1400px] mx-auto w-full">
                    <div className="flex flex-col select-none">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Send Notifications</h1>
                        <p className="text-xs text-slate-400 font-medium leading-none mt-1">
                            Send push notifications or emails to your users
                        </p>
                    </div>

                    {/* Tab Selection Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pt-2 select-none">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setSelectedTab("compose")}
                                className={`pb-3 text-xs font-bold transition-all relative select-none leading-none border-b-2 ${
                                    selectedTab === "compose"
                                        ? "border-[#b68512] text-slate-800"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Compose Message
                            </button>
                            <button
                                onClick={() => setSelectedTab("sent")}
                                className={`pb-3 text-xs font-bold transition-all relative select-none leading-none border-b-2 ${
                                    selectedTab === "sent"
                                        ? "border-[#b68512] text-slate-800"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Sent History
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Tabs Content */}
                    {selectedTab === "compose" ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none items-start">
                            {/* Left Column: Form Compose Message (65%) */}
                            <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col h-full min-h-[460px]">
                                <div className="mb-6 flex flex-col">
                                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight">Notification Content</h2>
                                    <p className="text-xs text-slate-400 mt-1 font-medium select-none">
                                        Compose your notification message
                                    </p>
                                </div>

                                <div className="space-y-6 flex-1 flex flex-col">
                                    {/* Title field */}
                                    <div className="space-y-1.5 select-none">
                                        <label className="text-xs font-bold text-slate-700 block select-none" htmlFor="title">
                                            Title<span className="text-amber-600 font-semibold">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            value={msgTitle}
                                            onChange={(e) => setMsgTitle(e.target.value)}
                                            placeholder="Notification Title"
                                            className="w-full h-11 px-4 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Message Text area field */}
                                    <div className="space-y-1.5 flex-1 flex flex-col select-none">
                                        <label className="text-xs font-bold text-slate-700 block select-none" htmlFor="msg">
                                            Message<span className="text-amber-600 font-semibold">*</span>
                                        </label>
                                        <textarea
                                            id="msg"
                                            value={msgBody}
                                            onChange={(e) => setMsgBody(e.target.value)}
                                            placeholder="Write your message here"
                                            className="w-full h-36 px-4 py-3.5 bg-white rounded-xl border border-slate-100 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-50 text-xs text-slate-700 placeholder:text-slate-300 transition-all outline-none resize-none flex-1"
                                        ></textarea>
                                    </div>

                                    {/* Footer char count and send */}
                                    <div className="flex items-center justify-between pt-4 select-none">
                                        <span className="text-[11px] text-slate-400 font-medium select-none">
                                            {msgBody.length} Characters
                                        </span>
                                        <button
                                            onClick={async () => {
                                                if (!msgTitle || !msgBody) {
                                                    alert("Please fill in both title and message body");
                                                    return;
                                                }
                                                try {
                                                    const res = await fetch("/api/admin/notifications", {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify({
                                                            title: msgTitle,
                                                            message: msgBody,
                                                            recipients: recipientsType,
                                                            type: deliveryChannel
                                                        })
                                                    });
                                                    if (res.ok) {
                                                        alert("Message Sent successfully!");
                                                        setMsgTitle("");
                                                        setMsgBody("");
                                                        fetchNotifications();
                                                        setSelectedTab("sent");
                                                    } else {
                                                        alert("Failed to send notification.");
                                                    }
                                                } catch (err) {
                                                    console.error("Error sending notification:", err);
                                                    alert("An error occurred.");
                                                }
                                            }}
                                            className="bg-[#b68512] hover:bg-[#9d720f] active:bg-[#85610d] px-5 py-2.5 rounded-full text-white font-bold text-xs select-none shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01]"
                                        >
                                            <Send size={12} className="rotate-0" />
                                            <span>Send Now</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Radio Filters Configuration (35%) */}
                            <div className="xl:col-span-1 space-y-6 select-none flex flex-col justify-between">
                                {/* Type selector card */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight select-none">
                                            Notification Type
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium select-none">
                                            Select delivery channel
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Email delivery type */}
                                        <div
                                            onClick={() => setDeliveryChannel("Email")}
                                            className="flex items-start gap-3 p-3 bg-[#fafafa]/60 border border-slate-50/70 hover:border-amber-100 hover:bg-amber-50/10 rounded-xl transition-all cursor-pointer select-none"
                                        >
                                            <div className="pt-0.5">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all select-none ${
                                                    deliveryChannel === "Email" ? "border-[#b68512]" : "border-slate-300"
                                                }`}>
                                                    {deliveryChannel === "Email" && <div className="w-2 h-2 rounded-full bg-[#b68512]"></div>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col select-none leading-tight">
                                                <span className="text-xs font-bold text-slate-800 select-none">Email</span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 select-none leading-none">
                                                    Send via email notification
                                                </span>
                                            </div>
                                        </div>

                                        {/* Push notification type */}
                                        <div
                                            onClick={() => setDeliveryChannel("Push")}
                                            className="flex items-start gap-3 p-3 bg-[#fafafa]/60 border border-slate-50/70 hover:border-amber-100 hover:bg-amber-50/10 rounded-xl transition-all cursor-pointer select-none"
                                        >
                                            <div className="pt-0.5">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all select-none ${
                                                    deliveryChannel === "Push" ? "border-[#b68512]" : "border-slate-300"
                                                }`}>
                                                    {deliveryChannel === "Push" && <div className="w-2 h-2 rounded-full bg-[#b68512]"></div>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col select-none leading-tight">
                                                <span className="text-xs font-bold text-slate-800 select-none">Push Notification</span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 select-none leading-none">
                                                    Send in app push notification
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recipients selector card */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight select-none">
                                            Recipients
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium select-none">
                                            Choose who will receive this notification
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Recipient types items mapped */}
                                        {(
                                            [
                                                { k: "All", title: "All Users", desc: "Send to everyone (24,563 users)" },
                                                { k: "Active", title: "Active Users", desc: "Users active in last 7 days (18,234 users)" },
                                                { k: "Verified", title: "KYC Verified Users", desc: "Users with verified KYC (18,942 users)" },
                                                { k: "Pending", title: "Pending KYC Users", desc: "Users with pending KYC (3,421 users)" },
                                                { k: "Inactive", title: "Inactive Users", desc: "No activity in 30+ days (2,329 users)" }
                                            ] as const
                                        ).map((recip) => (
                                            <div
                                                key={recip.k}
                                                onClick={() => setRecipientsType(recip.k)}
                                                className="flex items-start gap-3 p-3 bg-[#fafafa]/60 border border-slate-50/70 hover:border-amber-100 hover:bg-amber-50/10 rounded-xl transition-all cursor-pointer select-none"
                                            >
                                                <div className="pt-0.5">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all select-none ${
                                                        recipientsType === recip.k ? "border-[#b68512]" : "border-slate-300"
                                                    }`}>
                                                        {recipientsType === recip.k && <div className="w-2 h-2 rounded-full bg-[#b68512]"></div>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col select-none leading-tight">
                                                    <span className="text-xs font-bold text-slate-800 select-none">{recip.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 select-none leading-none">
                                                        {recip.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Tab: Sent Notifications list */
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between select-none">
                            <div className="mb-6 flex flex-col select-none">
                                <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight select-none">Sent Notifications</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1 leading-none select-none">
                                    History of all sent notifications
                                </p>
                            </div>

                            <div className="overflow-x-auto select-none">
                                <table className="w-full text-left border-collapse select-none">
                                    <thead>
                                        <tr className="border-b border-slate-50 select-none">
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Title
                                            </th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Recipients
                                            </th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Type
                                            </th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Sent At
                                            </th>
                                            <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Status
                                            </th>
                                            <th className="py-3 px-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 select-none">
                                        {(notifications.length > 0 ? notifications.map((n: any) => ({
                                            id: n.id,
                                            title: n.title,
                                            subtitle: n.message,
                                            recipients: n.recipients,
                                            type: n.type,
                                            sentAt: new Date(n.created_at).toLocaleDateString() + " . " + new Date(n.created_at).toLocaleTimeString(),
                                            status: n.status,
                                            isReal: true
                                        })) : sentNotifications.map((n: any) => ({ ...n, isReal: false }))).map((notif: any, idx: number) => {
                                            const keyId = notif.id || idx;
                                            return (
                                                <tr key={keyId} className="hover:bg-slate-50/50 cursor-pointer transition-colors select-none">
                                                    <td className="py-3 px-2 flex flex-col select-none">
                                                        <span className="font-bold text-xs text-slate-800 leading-tight">
                                                            {notif.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 mt-1 select-none font-medium leading-tight max-w-[320px] truncate">
                                                            {notif.subtitle}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-slate-500 font-semibold select-none leading-none">
                                                        {notif.recipients}
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-slate-400 font-medium select-none leading-none">
                                                        {notif.type}
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-slate-400 font-medium select-none leading-none">
                                                        {notif.sentAt}
                                                    </td>
                                                    <td className="py-3 px-2 select-none">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] select-none ${
                                                                notif.status === "DELIVERED"
                                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                    : notif.status === "PENDING"
                                                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                                    : "bg-red-50 text-red-600 border border-red-100"
                                                            }`}
                                                        >
                                                            {notif.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 select-none text-slate-400 hover:text-slate-600 relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(activeMenuId === keyId ? null : keyId);
                                                            }}
                                                            className="focus:outline-none p-1 rounded-md hover:bg-slate-100"
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {activeMenuId === keyId && (
                                                            <div className="absolute right-2 top-10 w-32 bg-white border border-slate-200/80 rounded-xl shadow-lg z-50 py-1 flex flex-col select-none">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (notif.isReal) {
                                                                            handleDeleteNotification(notif.id);
                                                                            setActiveMenuId(null);
                                                                        } else {
                                                                            alert("Dummy notifications cannot be deleted from the backend.");
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs text-left font-semibold hover:bg-red-50 hover:text-red-600 text-red-500 select-none"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
