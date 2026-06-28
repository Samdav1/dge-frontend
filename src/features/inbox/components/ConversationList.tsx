"use client";

import React, { useState } from "react";
import { Search, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Conversation } from "../types";
import FallbackImage from "@/components/ui/FallbackImage";

interface ConversationListProps {
    conversations: Conversation[];
    isLoading?: boolean;
    selectedId?: string | null;
    currentUserId?: string | null;
    onChatSelect?: (conversation: Conversation) => void;
    onDelete?: (conversationId: string) => void;
}

export function ConversationList({
    conversations,
    isLoading = false,
    selectedId,
    currentUserId,
    onChatSelect,
    onDelete
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConversations = conversations.filter((conv) =>
        (conv.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getConversationTitle = (conv: Conversation) => {
        if (conv.title) return conv.title;
        // For private chats, show the other participant's name
        if (conv.participants && conv.participants.length > 0) {
            const otherParticipant = conv.participants.find(p => p.user_id !== currentUserId);
            return otherParticipant?.username || 'Unknown User';
        }
        return conv.type === 'group' ? 'Group Chat' : 'New Conversation';
    };

    const getParticipantAvatar = (conv: Conversation) => {
        if (conv.participants && conv.participants.length > 0) {
            const otherParticipant = conv.participants.find(p => p.user_id !== currentUserId);
            return otherParticipant?.avatar_url || `https://i.pravatar.cc/150?u=${conv.id}`;
        }
        return `https://i.pravatar.cc/150?u=${conv.id}`;
    };

    const isParticipantOnline = (conv: Conversation) => {
        if (conv.participants && conv.participants.length > 0) {
            const otherParticipant = conv.participants.find(p => p.user_id !== currentUserId);
            return otherParticipant?.online || false;
        }
        return false;
    };

    const getLastMessagePreview = (conv: Conversation) => {
        if (conv.lastMessage) {
            const prefix = conv.lastMessage.sender_id === currentUserId ? 'you: ' : '';
            return prefix + (conv.lastMessage.content.length > 30
                ? conv.lastMessage.content.substring(0, 30) + '...'
                : conv.lastMessage.content);
        }
        return 'No messages yet';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 h-full min-h-0 flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">All Messages ({conversations.length})</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search"
                        className="pl-9 bg-gray-50 border-gray-100 rounded-xl h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new conversation to begin chatting</p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onChatSelect?.(conv)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedId === conv.id ? "bg-gray-50" : "hover:bg-gray-50"
                                }`}
                        >
                            <div className="relative">
                                <FallbackImage
                                    src={getParticipantAvatar(conv)}
                                    alt={getConversationTitle(conv)}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                {isParticipantOnline(conv) && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                                        {getConversationTitle(conv)}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatTime(conv.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate ${(conv.unreadCount || 0) > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                                        }`}>
                                        {getLastMessagePreview(conv)}
                                    </p>
                                    {(conv.unreadCount || 0) > 0 && (
                                        <span className="w-5 h-5 bg-[#C69C2E] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                    {onDelete && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(conv.id);
                                            }}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete conversation"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
