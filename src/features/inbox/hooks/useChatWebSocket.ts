"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message, WebSocketMessage, WebSocketIncoming } from '../types';
import { getBackendToken } from '../actions';

interface UseChatWebSocketOptions {
    token: string | null;
    conversationId?: string | null;
    onMessage?: (message: Message) => void;
    onCallInvite?: (data: { channelName: string; callerName?: string; callerAvatar?: string; conversationId: string; callerId?: string }) => void;
    onCallAccepted?: (data: { channelName: string; conversationId: string; accepterId?: string }) => void;
    onCallRejected?: (data: { channelName: string; conversationId: string; rejecterId?: string }) => void;
    onNegotiationUpdated?: (negotiationId: string) => void;
    onNotificationReceived?: (notification: Record<string, unknown>) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

interface UseChatWebSocketReturn {
    isConnected: boolean;
    sendMessage: (conversationId: string, content: string, metadataInfo?: Record<string, unknown>) => void;
    sendRaw: (data: Record<string, unknown>) => void;
    error: string | null;
}

const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
    return 'wss://dge-tech-web-cjhe4jg72a-ew.a.run.app';
};
const WS_BASE_URL = getWsUrl();
const MAX_RETRIES = 5;

export function useChatWebSocket(options: UseChatWebSocketOptions): UseChatWebSocketReturn {
    const { token, conversationId, onMessage, onCallInvite, onCallAccepted, onCallRejected, onNegotiationUpdated, onNotificationReceived, onConnect, onDisconnect, onError } = options;
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionStableTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const connectionAttemptRef = useRef(0);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use refs for callbacks to avoid dependency changes causing reconnects
    const onMessageRef = useRef(onMessage);
    const onCallInviteRef = useRef(onCallInvite);
    const onCallAcceptedRef = useRef(onCallAccepted);
    const onCallRejectedRef = useRef(onCallRejected);
    const onNegotiationUpdatedRef = useRef(onNegotiationUpdated);
    const onNotificationReceivedRef = useRef(onNotificationReceived);
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);
    const onErrorRef = useRef(onError);

    // Update refs when props change
    useEffect(() => {
        onMessageRef.current = onMessage;
        onCallInviteRef.current = onCallInvite;
        onCallAcceptedRef.current = onCallAccepted;
        onCallRejectedRef.current = onCallRejected;
        onNegotiationUpdatedRef.current = onNegotiationUpdated;
        onNotificationReceivedRef.current = onNotificationReceived;
        onConnectRef.current = onConnect;
        onDisconnectRef.current = onDisconnect;
        onErrorRef.current = onError;
    }, [onMessage, onCallInvite, onCallAccepted, onCallRejected, onNegotiationUpdated, onNotificationReceived, onConnect, onDisconnect, onError]);

    // Connect to WebSocket
    const connect = useCallback(async () => {
        if (!token) {
            return;
        }

        const currentAttempt = ++connectionAttemptRef.current;

        try {
            // Asynchronously fetch fresh backend token (triggers NextAuth auto-refresh if expired)
            const freshToken = await getBackendToken();

            if (currentAttempt !== connectionAttemptRef.current) {
                console.log('WebSocket connection attempt superseded');
                return;
            }

            if (!freshToken) {
                console.warn('Could not fetch fresh token for WebSocket connection');
                setError('Authentication token expired');
                return;
            }

            // Clean token if needed
            let cleanToken = freshToken;
            if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
                cleanToken = cleanToken.slice(1, -1);
            }

            // Close existing connection if any
            if (wsRef.current) {
                // Remove onclose listener to prevent triggering reconnection logic
                wsRef.current.onclose = null;
                wsRef.current.close();
            }

            console.log(`Connecting to WebSocket for conversation: ${conversationId}`);
            // Use generic endpoint as per user example
            const ws = new WebSocket(`${WS_BASE_URL}/chat/ws?token=${cleanToken}`);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                onConnectRef.current?.();

                // Only reset retry count if connection stays stable for 5 seconds
                if (connectionStableTimeoutRef.current) {
                    clearTimeout(connectionStableTimeoutRef.current);
                }
                connectionStableTimeoutRef.current = setTimeout(() => {
                    console.log('WebSocket connection stable, resetting retry count');
                    retryCountRef.current = 0;
                }, 5000);

                // We only connect globally now. Backend chat_ws.py auto-joins the user.
                if (conversationId) {
                    const joinMessage: WebSocketMessage = {
                        action: 'join',
                        conversation_id: conversationId,
                    };
                    ws.send(JSON.stringify(joinMessage));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketIncoming = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);

                    // Handle call invite messages
                    if (data.action === 'call_invite' && data.channel_name) {
                        console.log('WebSocket: Received call_invite for channel:', data.channel_name);
                        onCallInviteRef.current?.({
                            channelName: data.channel_name,
                            callerName: data.caller_name,
                            callerAvatar: data.caller_avatar,
                            conversationId: data.conversation_id,
                            callerId: data.user_id,
                        });
                        return;
                    }

                    // Handle call accepted messages
                    if (data.action === 'call_accept' && data.channel_name) {
                        console.log('WebSocket: Received call_accept for channel:', data.channel_name);
                        onCallAcceptedRef.current?.({
                            channelName: data.channel_name,
                            conversationId: data.conversation_id,
                            accepterId: data.user_id,
                        });
                        return;
                    }

                    // Handle call rejected messages
                    if (data.action === 'call_reject' && data.channel_name) {
                        console.log('WebSocket: Received call_reject for channel:', data.channel_name);
                        onCallRejectedRef.current?.({
                            channelName: data.channel_name,
                            conversationId: data.conversation_id,
                            rejecterId: data.user_id,
                        });
                        return;
                    }

                    // Handle notification
                    if (data.action === 'notification' && data.notification) {
                        console.log('WebSocket: Received notification:', data.notification);
                        onNotificationReceivedRef.current?.(data.notification);
                        return;
                    }

                    // Handle global ride requests
                    if (data.type === 'ride_requested') {
                        console.log('WebSocket: Received global ride_requested:', data);

                        // Show toast notification using Sonner
                        toast.success("New Ride Request!", {
                            description: "A passenger has requested a ride from you. Check your Driving tab to accept it.",
                            duration: 10000,
                            action: {
                                label: "View Request",
                                onClick: () => window.location.href = "/dashboard/driving"
                            }
                        });

                        onNotificationReceivedRef.current?.({
                            id: data.trip_id,
                            type: 'ride_requested',
                            title: 'New Ride Request',
                            message: 'A passenger has requested a ride from you!',
                            data: data,
                            created_at: new Date().toISOString(),
                            is_read: false
                        });
                        // Don't return here, maybe other listeners need it
                    }

                    // Handle negotiation update
                    if (data.action === 'negotiation_updated' && data.negotiation_id) {
                        console.log('WebSocket: Received negotiation update:', data.negotiation_id);
                        onNegotiationUpdatedRef.current?.(data.negotiation_id);
                        return;
                    }

                    // Extract message from the incoming data
                    if (data.message) {
                        onMessageRef.current?.(data.message);
                    } else if (data.content) {
                        // Construct a message object from simpler format
                        const message: Message = {
                            id: crypto.randomUUID(),
                            conversation_id: data.conversation_id,
                            sender_id: data.user_id,
                            content: data.content,
                            content_type: 'text',
                            status: 'delivered',
                            created_at: new Date().toISOString(),
                        };
                        onMessageRef.current?.(message);
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                onDisconnectRef.current?.();

                // Clear stable connection timer if it exists
                if (connectionStableTimeoutRef.current) {
                    clearTimeout(connectionStableTimeoutRef.current);
                    connectionStableTimeoutRef.current = null;
                }

                // Don't reconnect if we intentionally closed it or if max retries reached
                if (retryCountRef.current >= MAX_RETRIES) {
                    console.error('Max WebSocket retries reached. Stopping reconnection.');
                    setError('Connection failed after multiple attempts');
                    return;
                }

                // Attempt to reconnect after delay
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }

                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
                retryCountRef.current += 1;

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log(`Attempting to reconnect... (Attempt ${retryCountRef.current})`);
                    connect();
                }, delay);
            };

            ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('Connection error');
                onErrorRef.current?.(event);
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to connect');
        }
    }, [token, conversationId]); // Reconnect if token or conversation changes

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        connectionAttemptRef.current++;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (connectionStableTimeoutRef.current) {
            clearTimeout(connectionStableTimeoutRef.current);
            connectionStableTimeoutRef.current = null;
        }
        if (wsRef.current) {
            // Remove listeners to prevent reconnection loops during unmount/change
            wsRef.current.onclose = null;
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        retryCountRef.current = 0;
    }, []);

    // Send a text message
    const sendMessage = useCallback((targetConversationId: string, content: string, metadataInfo?: Record<string, unknown>) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const message: WebSocketMessage = {
                action: 'message',
                conversation_id: targetConversationId,
                content,
                metadataInfo,
            };
            wsRef.current.send(JSON.stringify(message));
            console.log('Sent message:', content);
        } else {
            console.error('WebSocket not connected, cannot send message');
            setError('Not connected');
        }
    }, []);

    // Send a raw JSON object (used for call_invite, call_reject, etc.)
    const sendRaw = useCallback((data: Record<string, unknown>) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
            console.log('Sent raw WS:', data);
        } else {
            console.error('WebSocket not connected, cannot send raw data');
        }
    }, []);

    // Connect on mount or when dependencies change
    useEffect(() => {
        if (token) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [token, connect, disconnect]);

    // Send a join message automatically if conversationId changes, but do NOT reconnect
    useEffect(() => {
        if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && conversationId) {
            wsRef.current.send(JSON.stringify({
                action: 'join',
                conversation_id: conversationId
            }));
        }
    }, [isConnected, conversationId]);

    return {
        isConnected,
        sendMessage,
        sendRaw,
        error,
    };
}
