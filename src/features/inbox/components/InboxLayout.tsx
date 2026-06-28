"use client";

import React, { useState, useEffect } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { Conversation } from "../types";
import { getUserConversations, getParticipants, deleteConversation } from "../actions";
import { useChatContext } from "@/providers/ChatProvider";
import { useSearchParams } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function InboxLayout() {
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const searchParams = useSearchParams();
    const conversationIdParam = searchParams.get("conversationId");

    const { isConnected, newMessage, sendMessage, startOutboundCall, userId } = useChatContext();

    // Fetch participants for a conversation
    const fetchParticipants = async (conversationId: string) => {
        try {
            const result = await getParticipants(conversationId);
            if (result.success && result.data) {
                setConversations(prev => prev.map(c =>
                    c.id === conversationId
                        ? { ...c, participants: result.data }
                        : c
                ));
                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(prev => prev ? { ...prev, participants: result.data } : null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch participants:", error);
        }
    };

    // Load conversations and handle initial selection from URL
    useEffect(() => {
        async function loadConversations() {
            setIsLoading(true);
            try {
                const result = await getUserConversations();
                if (result.success && result.data) {
                    const uniqueConversations = Array.from(
                        new Map((result.data as Conversation[]).map(c => [c.id, c])).values()
                    );
                    setConversations(uniqueConversations);

                    if (conversationIdParam) {
                        const targetConversation = (result.data as Conversation[]).find(c => c.id === conversationIdParam);
                        if (targetConversation) {
                            setSelectedConversation(targetConversation);
                            setMobileView("chat");
                            fetchParticipants(targetConversation.id);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load conversations:", error);
                setError("Failed to load conversations. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
        loadConversations();
    }, [conversationIdParam]);

    // Update conversation lastMessage whenever newMessage updates
    useEffect(() => {
        if (newMessage) {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === newMessage.conversation_id
                        ? { ...conv, lastMessage: newMessage }
                        : conv
                )
            );
        }
    }, [newMessage]);


    const handleChatSelect = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setMobileView("chat");
        fetchParticipants(conversation.id);
    };

    const handleSendMessage = (conversationId: string, content: string) => {
        sendMessage(conversationId, content);
    };

    const handleStartCall = (targetUserId: string, targetUserName?: string, targetUserAvatar?: string) => {
        startOutboundCall(targetUserId, targetUserName, targetUserAvatar, selectedConversation?.id);
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversationToDelete(conversationId);
    };

    const confirmDeleteConversation = async () => {
        if (!conversationToDelete) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteConversation(conversationToDelete);
            if (result.success) {
                setConversations(prev => prev.filter(c => c.id !== conversationToDelete));
                if (selectedConversation?.id === conversationToDelete) {
                    setSelectedConversation(null);
                    setMobileView("list");
                }
                setConversationToDelete(null);
            } else {
                setError(result.error || "Failed to delete conversation");
                setConversationToDelete(null);
            }
        } catch (err) {
            console.error("Delete conversation error:", err);
            setError("Failed to delete conversation");
            setConversationToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="-m-4 md:-m-8 flex flex-col overflow-hidden bg-gray-50"
            style={{ height: 'calc(100dvh - 64px)' }}
        >
            <div className="px-4 pt-4 pb-2 md:px-8 md:pt-6 md:pb-4 flex flex-row items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#C69C2E]">Messages</span>
                    {isConnected && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" title="Chat Connected" />
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 pb-4 md:px-8 md:pb-8 min-h-0 overflow-hidden">
                {error && (
                    <div className="lg:col-span-3 bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                <div className={`lg:col-span-1 h-full min-h-0 ${mobileView === "chat" ? "hidden lg:block" : "block"}`}>
                    <ConversationList
                        conversations={conversations}
                        isLoading={isLoading}
                        selectedId={selectedConversation?.id}
                        currentUserId={userId ?? undefined}
                        onChatSelect={handleChatSelect}
                        onDelete={handleDeleteConversation}
                    />
                </div>
                <div className={`lg:col-span-2 h-full min-h-0 ${mobileView === "chat" ? "block" : "hidden lg:block"}`}>
                    <ChatWindow
                        conversation={selectedConversation}
                        currentUserId={userId ?? null}
                        isConnected={isConnected}
                        onBack={() => setMobileView("list")}
                        onSendMessage={handleSendMessage}
                        onStartCall={handleStartCall}
                        newMessage={newMessage}
                    />
                </div>
            </div>

            <Dialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl">
                    <DialogTitle className="sr-only">Delete Conversation</DialogTitle>
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Trash2 className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Delete Conversation
                        </h2>

                        <p className="text-gray-500 mb-8 text-sm">
                            Are you sure you want to delete this conversation?
                        </p>

                        <div className="flex gap-4 w-full">
                            <Button
                                onClick={confirmDeleteConversation}
                                disabled={isDeleting}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setConversationToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white h-12 rounded-xl"
                            >
                                No, Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
