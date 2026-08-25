"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, ExternalLink, Car } from "lucide-react";
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/features/notifications/actions";
import { useChatContext } from "@/providers/ChatProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeNotification, setActiveNotification] = useState<any | null>(null);
    const { latestNotification } = useChatContext();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        const res = await getNotifications();
        if (res.success) {
            setNotifications(res.data || []);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (latestNotification) {
            // Avoid adding duplicates if the notification is already in the list
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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await deleteNotification(id);
        if (res.success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:w-80 sm:mt-2 bg-white rounded-xl sm:rounded-lg shadow-2xl sm:shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-medium text-gray-900">Notifications</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {unreadCount} New
                        </span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification?.is_read ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => {
                                            if (!notification?.is_read) handleMarkAsRead(notification.id);
                                            setActiveNotification(notification);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification?.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notification?.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {!notification?.is_read && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                    className="text-gray-400 hover:text-primary transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => handleDelete(notification.id, e)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Full Details Modal */}
            <Dialog open={!!activeNotification} onOpenChange={(open) => !open && setActiveNotification(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Notification Details</DialogTitle>
                        <DialogDescription>
                            {activeNotification && new Date(activeNotification.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-800">{activeNotification?.message}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveNotification(null)}>Close</Button>
                        {activeNotification?.metadataInfo?.type === 'ride_requested' && (
                            <Button 
                                onClick={() => {
                                    setActiveNotification(null);
                                    window.location.href = "/dashboard/driving";
                                }}
                                className="bg-[#C69C2E] hover:bg-[#A37B20]"
                            >
                                <Car className="w-4 h-4 mr-2" />
                                View Ride Request
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
