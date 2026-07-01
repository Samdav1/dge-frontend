"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Paperclip, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversation, Message } from "../types";
import { getMessages, createMessage } from "../actions";
import FallbackImage from "@/components/ui/FallbackImage";

interface ChatWindowProps {
    conversation: Conversation | null;
    currentUserId: string | null;
    isConnected?: boolean;
    onBack?: () => void;
    onSendMessage?: (conversationId: string, content: string) => void;
    onStartCall?: (targetUserId: string, targetUserName?: string, targetUserAvatar?: string) => void;
    newMessage?: Message | null;
}

export function ChatWindow({
    conversation,
    currentUserId,
    isConnected = false,
    onBack,
    onSendMessage,
    onStartCall,
    newMessage
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages when conversation changes
    useEffect(() => {
        async function loadMessages() {
            if (!conversation?.id) {
                setMessages([]);
                return;
            }

            setIsLoading(true);
            try {
                const result = await getMessages(conversation.id);
                if (result.success && result.data) {
                    setMessages(result.data);
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadMessages();
    }, [conversation?.id]);

    // Handle new messages from WebSocket
    useEffect(() => {
        if (newMessage && newMessage.conversation_id === conversation?.id) {
            setMessages((prev) => {
                // Check if message already exists by ID
                const exists = prev.some((m) => m.id === newMessage.id);
                if (exists) return prev;

                // Check if we have an optimistic message with the same content
                // This prevents duplication when WS echoes back our own message
                const optimisticMatchIndex = prev.findIndex(m =>
                    m.id.startsWith('temp-') &&
                    m.content === newMessage.content &&
                    m.sender_id === newMessage.sender_id
                );

                if (optimisticMatchIndex !== -1) {
                    // Replace optimistic message with real one
                    const newMessages = [...prev];
                    newMessages[optimisticMatchIndex] = newMessage;
                    return newMessages;
                }

                return [...prev, newMessage];
            });
        }
    }, [newMessage, conversation?.id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !conversation?.id || !currentUserId) return;

        const content = inputValue.trim();
        setInputValue("");
        setIsSending(true);

        // Optimistically add message to UI
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            conversation_id: conversation.id,
            sender_id: currentUserId,
            content,
            content_type: "text",
            status: "sent",
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            // Send via WebSocket for real-time
            if (onSendMessage) {
                onSendMessage(conversation.id, content);
            }

            // We rely on WebSocket for persistence now, so no API call needed
            // The optimistic message will be replaced when the WS echo arrives
        } catch (error) {
            console.error("Failed to send message:", error);
            // Mark optimistic message as failed
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === optimisticMessage.id
                        ? { ...m, status: "failed" as const }
                        : m
                )
            );
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getConversationTitle = () => {
        if (!conversation) return "Select a conversation";
        // For private chats, always prefer the other participant's username
        if (conversation.participants && conversation.participants.length > 0) {
            const other = conversation.participants.find(
                (p) => p.user_id !== currentUserId
            );
            if (other?.username) return other.username;
        }
        // Fall back to title for group chats
        if (conversation.title && conversation.title !== 'New Conversation' && conversation.title.trim() !== '') {
            return conversation.title;
        }
        return conversation.type === 'group' ? 'Group Chat' : 'Chat';
    };

    const getAvatarUrl = () => {
        if (!conversation) return "";
        if (conversation.participants && conversation.participants.length > 0) {
            const other = conversation.participants.find(
                (p) => p.user_id !== currentUserId
            );
            return other?.avatar_url || "";
        }
        return "";
    };

    const getOtherParticipant = () => {
        if (!conversation?.participants) return { userId: "", userName: "" };
        const other = conversation.participants.find(
            (p) => p.user_id !== currentUserId
        );
        return {
            userId: other?.user_id || "",
            userName: other?.username || getConversationTitle(),
        };
    };

    if (!conversation) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 h-full flex items-center justify-center">
                <div className="text-center text-gray-400 px-4">
                    <p className="text-base font-medium">No conversation selected</p>
                    <p className="text-sm mt-1">Select a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="px-3 py-2.5 md:p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden -ml-2 text-gray-500"
                            onClick={onBack}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div className="relative">
                        <FallbackImage
                            src={getAvatarUrl()}
                            alt={getConversationTitle()}
                            username={getConversationTitle()}
                            isAvatar={true}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {isConnected && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                            {getConversationTitle()}
                        </h3>
                        <p className={`text-xs ${isConnected ? "text-green-500" : "text-gray-400"}`}>
                            {isConnected ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#C69C2E] bg-[#FDF8E9] hover:bg-[#FDF8E9]/80 rounded-full"
                    onClick={() => {
                        const other = getOtherParticipant();
                        onStartCall?.(other.userId, other.userName, getAvatarUrl());
                    }}
                    title="Start video call"
                >
                    <Phone className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-2 py-3 md:p-6 space-y-3 md:space-y-5 bg-gray-50/30 overflow-x-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        const isCallSystemMessage = msg.metadataInfo?.type === "call";
                        const isMissed = msg.metadataInfo?.status === "missed" || msg.metadataInfo?.status === "canceled";

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-2 md:gap-3 ${isMe ? "flex-row-reverse" : ""} ${isCallSystemMessage ? "justify-center w-full" : ""}`}
                            >
                                {!isMe && !isCallSystemMessage && (
                                    <FallbackImage
                                        src={msg.sender?.avatar_url || getAvatarUrl()}
                                        alt={msg.sender?.username || "User"}
                                        username={msg.sender?.username || "User"}
                                        isAvatar={true}
                                        className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover mt-auto shrink-0"
                                    />
                                )}

                                {isCallSystemMessage ? (
                                    <div className="bg-gray-100 py-1.5 px-4 rounded-full flex items-center justify-center gap-2 max-w-[80%] mx-auto mt-2 mb-2 shadow-sm border border-gray-200/50">
                                        <div className={`p-1.5 rounded-full ${isMissed ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-700"}`}>
                                            {isMissed ? <PhoneOff className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-medium ${isMissed ? "text-red-600" : "text-gray-700"}`}>
                                                {msg.content}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium ml-2">
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-[88%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"
                                            } flex flex-col min-w-0`}
                                    >
                                        <div
                                            className={`px-3 py-2 md:p-4 rounded-2xl text-xs md:text-sm break-words w-full ${isMe
                                                ? "bg-[#C69C2E]/10 text-gray-900 rounded-br-none"
                                                : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                                                }`}
                                        >
                                            <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 px-1">
                                            {isMe && msg.status === "read" && (
                                                <span className="text-green-500 text-[10px]">✓✓</span>
                                            )}
                                            {isMe && msg.status === "delivered" && (
                                                <span className="text-gray-400 text-[10px]">✓✓</span>
                                            )}
                                            {isMe && msg.status === "sent" && (
                                                <span className="text-gray-400 text-[10px]">✓</span>
                                            )}
                                            {msg.status === "failed" && (
                                                <span className="text-red-500 text-[10px]">Failed</span>
                                            )}
                                            <span className="text-[10px] text-gray-400">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Negotiation Context Label */}
            {conversation.metadataInfo && (conversation.metadataInfo.context === 'negotiation' || conversation.metadataInfo.negotiation_id || Object.keys(conversation.metadataInfo).length > 0) && (
                <div className="bg-[#FDF8E9] border-t border-b border-[#C69C2E]/20 px-4 py-2 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C69C2E] animate-pulse" />
                    <p className="text-xs font-medium text-[#8B6914]">
                        Negotiation mode activated
                        {conversation.metadataInfo?.service_id ? ` (Service: ${conversation.metadataInfo.service_id})` : ''}
                    </p>
                </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-2.5 md:p-4 border-t border-gray-100 bg-white rounded-b-2xl shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 md:p-2 rounded-xl">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                        placeholder="Type your message here.."
                        className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-gray-400"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                    />
                    <Button
                        size="icon"
                        className="bg-[#C69C2E] hover:bg-[#b08b29] text-white rounded-full w-10 h-10 flex-shrink-0"
                        onClick={handleSend}
                        disabled={isSending || !inputValue.trim()}
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>


        </div>
    );
}
