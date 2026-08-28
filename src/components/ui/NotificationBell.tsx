"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Car, Sparkles, Clock, AlertCircle } from "lucide-react";
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/features/notifications/actions";
import { useChatContext } from "@/providers/ChatProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playNotificationSound } from "@/lib/sound";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeNotification, setActiveNotification] = useState<any | null>(null);
    const { latestNotification } = useChatContext();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef<number>(0);

    const fetchNotifications = async () => {
        const res = await getNotifications();
        if (res.success && res.data) {
            const list = res.data || [];
            const unread = list.filter((n: any) => !n?.is_read).length;
            if (unread > prevCountRef.current && prevCountRef.current !== 0) {
                playNotificationSound();
            }
            prevCountRef.current = unread;
            setNotifications(list);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        const handleFocusOrVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        };

        window.addEventListener("focus", handleFocusOrVisibility);
        document.addEventListener("visibilitychange", handleFocusOrVisibility);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", handleFocusOrVisibility);
            document.removeEventListener("visibilitychange", handleFocusOrVisibility);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        if (latestNotification) {
            playNotificationSound();
            setNotifications(prev => {
                const exists = prev.some(n => n.id === latestNotification.id);
                if (exists) return prev;
                return [latestNotification, ...prev];
            });
        }
    }, [latestNotification]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n?.is_read).length;

    const handleMarkAsRead = async (id: string) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const res = await deleteNotification(id);
        if (res.success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (activeNotification?.id === id) {
                setActiveNotification(null);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-[#0D0D0D] flex items-center justify-center animate-pulse shadow-md shadow-red-500/30">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:w-96 sm:mt-3 bg-white dark:bg-[#121215] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-gray-200/80 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header with subtle border line */}
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/80 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-[#C69C2E]" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                        </div>
                        {unreadCount > 0 && (
                            <span className="text-[11px] bg-[#C69C2E]/15 text-[#C69C2E] border border-[#C69C2E]/30 px-2.5 py-0.5 rounded-full font-bold">
                                {unreadCount} Unread
                            </span>
                        )}
                    </div>
                    
                    {/* Scrollable list */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications yet</p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">We'll alert you when something happens</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`p-4 transition-all cursor-pointer flex gap-3 group relative ${
                                        !notification?.is_read 
                                            ? 'bg-amber-500/5 dark:bg-[#C69C2E]/10 border-l-4 border-l-[#C69C2E]' 
                                            : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                    onClick={() => {
                                        if (!notification?.is_read) handleMarkAsRead(notification.id);
                                        setActiveNotification(notification);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="mt-1">
                                        {!notification?.is_read ? (
                                            <span className="w-2 h-2 rounded-full bg-[#C69C2E] block ring-4 ring-[#C69C2E]/20" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 block" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className={`text-xs leading-relaxed ${!notification?.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                                        {!notification?.is_read && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#C69C2E] hover:bg-[#C69C2E]/10 transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {/* Red Delete Button */}
                                        <button 
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-950/30 dark:hover:bg-red-600 transition-all duration-200 shadow-sm"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Full Details Modal */}
            <Dialog open={!!activeNotification} onOpenChange={(open) => !open && setActiveNotification(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.5)] rounded-3xl p-6">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#C69C2E]/10 border border-[#C69C2E]/30 flex items-center justify-center text-[#C69C2E]">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                                    Notification Details
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-[#C69C2E]" />
                                    {activeNotification && new Date(activeNotification.created_at).toLocaleString()}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Subtle border line and content box */}
                    <div className="my-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/5 space-y-3">
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                            {activeNotification?.message}
                        </p>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
                        {/* Red Delete Button inside Modal */}
                        <Button 
                            variant="outline" 
                            onClick={() => activeNotification && handleDelete(activeNotification.id)}
                            className="w-full sm:w-auto border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-xs font-bold rounded-xl h-10 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                        </Button>

                        <div className="flex gap-2 w-full sm:w-auto ml-auto">
                            <Button 
                                variant="outline" 
                                onClick={() => setActiveNotification(null)}
                                className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl h-10 border-gray-200 dark:border-white/10"
                            >
                                Close
                            </Button>

                            {(activeNotification?.metadataInfo?.type === 'ride_requested' || activeNotification?.type === 'ride_requested' || activeNotification?.message?.toLowerCase().includes('ride')) && (
                                <Button 
                                    onClick={() => {
                                        setActiveNotification(null);
                                        window.location.href = "/dashboard/driving";
                                    }}
                                    className="flex-1 sm:flex-initial bg-[#C69C2E] hover:bg-[#b08b29] text-white text-xs font-bold rounded-xl h-10 shadow-md shadow-[#C69C2E]/20"
                                >
                                    <Car className="w-3.5 h-3.5 mr-1.5" />
                                    View Ride
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
