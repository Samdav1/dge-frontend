"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Message } from "@/features/inbox/types";
import { getBackendToken, getCurrentUserId } from "@/features/inbox/actions";
import { useChatWebSocket } from "@/features/inbox/hooks/useChatWebSocket";
import { useRouter } from "next/navigation";
import { useAgoraCall } from "@/features/inbox/hooks/useAgoraCall";
import { CallModal } from "@/features/inbox/components/CallModal";

import { playNotificationSound } from "@/lib/sound";

interface ChatContextType {
    token: string | null;
    userId: string | null;
    isConnected: boolean;
    newMessage: Message | null;
    sendMessage: (conversationId: string, content: string, metadataInfo?: Record<string, unknown>) => void;
    sendRaw: (data: Record<string, unknown>) => void;
    startOutboundCall: (targetUserId: string, targetUserName?: string, targetUserAvatar?: string, conversationId?: string) => void;
    latestNotification: Record<string, unknown> | null;
    latestNegotiationUpdate: string | null;
    unreadRideRequests: number;
    clearUnreadRideRequests: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState<Message | null>(null);
    const [latestNotification, setLatestNotification] = useState<Record<string, unknown> | null>(null);
    const [latestNegotiationUpdate, setLatestNegotiationUpdate] = useState<string | null>(null);
    const [unreadRideRequests, setUnreadRideRequests] = useState(0);
    const router = useRouter();

    const clearUnreadRideRequests = useCallback(() => {
        setUnreadRideRequests(0);
    }, []);

    // Call state exactly as it was in InboxLayout
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callTarget, setCallTarget] = useState<{ id: string; name?: string; avatar?: string } | null>(null);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [pendingChannelName, setPendingChannelName] = useState<string | null>(null);
    const [activeCallConversationId, setActiveCallConversationId] = useState<string | null>(null);

    // Load auth info globally
    useEffect(() => {
        async function loadAuth() {
            try {
                const [backendToken, currentUserId] = await Promise.all([
                    getBackendToken(),
                    getCurrentUserId(),
                ]);
                setToken(backendToken);
                setUserId(currentUserId);
            } catch (err) {
                console.error("Failed to load global auth token for ChatProvider", err);
            }
        }
        loadAuth();
    }, []);

    // ─────────────── AGORA CALL HOOK ───────────────
    const {
        callState,
        startCall,
        endCall,
        toggleAudio,
    } = useAgoraCall({
        onCallEnded: () => {
            console.log("Global Call ended, closing modal shortly");

            // Only the caller logs the call end to avoid duplicate WS messages
            if (!isIncomingCall && activeCallConversationId && callState.callDuration > 0) {
                sendMessage(activeCallConversationId, `Call ended (${callState.callDuration}s)`, {
                    type: "call",
                    status: "ended",
                    duration: callState.callDuration
                });
            }

            setTimeout(() => {
                setIsIncomingCall(false);
                setPendingChannelName(null);
                setActiveCallConversationId(null);
                setIsCallModalOpen(false);
                setCallTarget(null);
            }, 1500);
        },
        onError: (err) => console.error("Global Call error:", err),
    });

    // Handle normal chat message
    const handleIncomingMessage = useCallback((message: Message) => {
        setNewMessage(message);
    }, []);

    const handleCallInvite = useCallback((data: {
        channelName: string;
        callerName?: string;
        callerAvatar?: string;
        conversationId: string;
        callerId?: string;
    }) => {
        console.log("=== GLOBAL INCOMING CALL INVITE ===", data);
        if (data.callerId && data.callerId === userId) return;
        if (isCallModalOpen) return;

        setPendingChannelName(data.channelName);
        setActiveCallConversationId(data.conversationId);
        setIsIncomingCall(true);
        setCallTarget({
            id: data.channelName,
            name: data.callerName || "Unknown Caller",
            avatar: data.callerAvatar,
        });
        setIsCallModalOpen(true);
    }, [isCallModalOpen, userId]);

    const handleCallAccepted = useCallback((data: {
        channelName: string;
        conversationId: string;
        accepterId?: string;
    }) => {
        console.log("=== GLOBAL CALL ACCEPTED ===", data);
        if (data.accepterId && data.accepterId === userId) return;

        if (pendingChannelName && pendingChannelName === data.channelName) {
            startCall(data.channelName, callTarget?.name);
        }
    }, [userId, pendingChannelName, callTarget?.name, startCall]);

    const handleCallRejected = useCallback((data: {
        channelName: string;
        conversationId: string;
        rejecterId?: string;
    }) => {
        console.log("=== GLOBAL CALL REJECTED ===", data);
        if (pendingChannelName && pendingChannelName === data.channelName) {
            endCall();
            setTimeout(() => {
                setIsIncomingCall(false);
                setPendingChannelName(null);
                setActiveCallConversationId(null);
                setIsCallModalOpen(false);
                setCallTarget(null);
            }, 1500);
        }
    }, [pendingChannelName, endCall]);

    const handleNegotiationUpdated = useCallback((negotiationId: string) => {
        console.log("Global negotiation updated:", negotiationId);
        setLatestNegotiationUpdate(negotiationId);
        router.refresh();
    }, [router]);

    const handleNotificationReceived = useCallback((notification: Record<string, unknown>) => {
        console.log("Global notification received:", notification);
        playNotificationSound();
        setLatestNotification(notification);
        if (notification.type === 'ride_requested') {
            setUnreadRideRequests(prev => prev + 1);
        }
    }, []);

    // WebSocket connection operates globally now
    const { isConnected, sendMessage, sendRaw } = useChatWebSocket({
        token,
        conversationId: undefined, // Listen to ALL
        onMessage: handleIncomingMessage,
        onCallInvite: handleCallInvite,
        onCallAccepted: handleCallAccepted,
        onCallRejected: handleCallRejected,
        onNegotiationUpdated: handleNegotiationUpdated,
        onNotificationReceived: handleNotificationReceived,
        onConnect: () => console.log("Global Chat WebSocket connected"),
        onDisconnect: () => console.log("Global Chat WebSocket disconnected"),
    });

    // Context Outbound Call function
    const startOutboundCall = useCallback((targetUserId: string, targetUserName?: string, targetUserAvatar?: string, conversationId?: string) => {
        const channelName = conversationId || `direct-${targetUserId}`;

        if (conversationId) {
            sendRaw({
                action: "call_invite",
                conversation_id: conversationId,
                channel_name: channelName,
            });
        }

        setPendingChannelName(channelName);
        setActiveCallConversationId(conversationId || null);
        setIsIncomingCall(false);
        setCallTarget({
            id: channelName,
            name: targetUserName,
            avatar: targetUserAvatar,
        });
        setIsCallModalOpen(true);
    }, [sendRaw]);

    // User explicitly acts on Modal Accept
    const handleAcceptCall = useCallback(() => {
        if (pendingChannelName) {
            const targetConversation = activeCallConversationId;
            if (targetConversation) {
                sendRaw({
                    action: "call_accept",
                    conversation_id: targetConversation,
                    channel_name: pendingChannelName,
                });
            }
            setIsIncomingCall(false);
            startCall(pendingChannelName, callTarget?.name);
        }
    }, [pendingChannelName, startCall, callTarget?.name, activeCallConversationId, sendRaw]);

    // User explicitly acts on Modal Reject/Cancel
    const handleRejectCall = useCallback(() => {
        const targetConversation = activeCallConversationId;
        if (targetConversation) {
            sendRaw({
                action: "call_reject",
                conversation_id: targetConversation,
                channel_name: pendingChannelName || "",
            });

            if (!isIncomingCall) {
                sendMessage(targetConversation, "Canceled call", { type: "call", status: "canceled" });
            } else {
                sendMessage(targetConversation, "Missed call", { type: "call", status: "missed" });
            }
        }

        endCall();
        setTimeout(() => {
            setIsIncomingCall(false);
            setPendingChannelName(null);
            setActiveCallConversationId(null);
            setIsCallModalOpen(false);
            setCallTarget(null);
        }, 1500);
    }, [activeCallConversationId, sendRaw, pendingChannelName, isIncomingCall, sendMessage, endCall]);

    const value = {
        token,
        userId,
        isConnected,
        newMessage,
        sendMessage,
        sendRaw,
        startOutboundCall,
        latestNotification,
        latestNegotiationUpdate,
        unreadRideRequests,
        clearUnreadRideRequests,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
            {/* Global Call Modal */}
            {callTarget && (
                <CallModal
                    isOpen={isCallModalOpen}
                    onClose={() => { handleRejectCall(); }}
                    targetUserId={callTarget.id}
                    targetUserName={callTarget.name}
                    targetUserAvatar={callTarget.avatar}
                    isIncoming={isIncomingCall}
                    callState={callState}
                    startCall={startCall}
                    endCall={endCall}
                    toggleAudio={toggleAudio}
                    onAcceptCall={handleAcceptCall}
                    onRejectCall={handleRejectCall}
                />
            )}
        </ChatContext.Provider>
    );
}
