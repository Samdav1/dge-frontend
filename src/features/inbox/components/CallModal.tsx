"use client";

import React, { useEffect, useRef } from "react";
import { X, Phone, PhoneOff, Mic, MicOff, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallState } from "../call-types";
import FallbackImage from "@/components/ui/FallbackImage";

export interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: string;
    targetUserName?: string;
    targetUserAvatar?: string;
    isIncoming?: boolean;
    // Call control props
    callState: CallState;
    startCall: (channelName: string, userName?: string) => Promise<boolean>;
    endCall: () => Promise<void>;
    toggleAudio: () => void;
    // Incoming call handlers
    onAcceptCall?: () => void;
    onRejectCall?: () => void;
}

export function CallModal({
    isOpen,
    onClose,
    targetUserId,
    targetUserName,
    targetUserAvatar,
    isIncoming = false,
    callState,
    startCall,
    endCall,
    toggleAudio,
    onAcceptCall,
    onRejectCall,
}: CallModalProps) {

    // Determine if we're waiting for the other side
    const isOutgoingWaiting = !isIncoming && callState.status === "idle" && isOpen;
    const isIncomingWaiting = isIncoming && (callState.status === "idle" || callState.status === "ringing");

    // Handle close
    const handleClose = () => {
        if (isOutgoingWaiting || isIncomingWaiting) {
            onRejectCall?.();
        } else {
            endCall();
        }
        // Do NOT call onClose() here. Let the InboxLayout state manage when the modal unmounts.
    };

    // Format call duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };



    // Get status text
    const getStatusText = () => {
        if (isOutgoingWaiting) return "Ringing...";
        if (isIncomingWaiting) return "Incoming call...";

        switch (callState.status) {
            case "idle":
                return "Initializing...";
            case "ringing":
                return "Incoming call...";
            case "joining":
                return "Connecting...";
            case "connected":
                return formatDuration(callState.callDuration);
            case "ended":
                return "Call ended";
            case "failed":
                return callState.error || "Call failed";
            default:
                return "";
        }
    };

    if (!isOpen) return null;

    // Show Accept/Reject for incoming calls that haven't been answered
    const showIncomingControls = isIncomingWaiting;
    // Show "Ringing..." for outgoing calls waiting for acceptance
    const showRingingState = isOutgoingWaiting || isIncomingWaiting;
    // Show normal call controls (mute, end) when joined or joining
    const showCallControls = !showIncomingControls && !isOutgoingWaiting;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Avatar and Info */}
                <div className="flex flex-col items-center px-6 pb-8">
                    {/* Avatar */}
                    <div className="relative mb-6">
                        {/* Pulse animation when ringing or joining */}
                        {(showRingingState || callState.status === "joining") && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-[#C69C2E]/30 animate-ping" style={{ animationDuration: "1.5s" }} />
                                <div className="absolute inset-0 rounded-full bg-[#C69C2E]/20 animate-pulse" />
                            </>
                        )}

                        {/* Connected pulse */}
                        {callState.status === "connected" && (
                            <div className="absolute -inset-2 rounded-full border-2 border-green-500/50 animate-pulse" />
                        )}

                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#C69C2E] to-[#8B6914] flex items-center justify-center overflow-hidden">
                            <FallbackImage
                                src={targetUserAvatar}
                                alt={targetUserName || "User"}
                                username={targetUserName || "User"}
                                isAvatar={true}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {targetUserName || "Unknown User"}
                    </h2>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-8">
                        {(showRingingState || callState.status === "joining") && (
                            <Loader2 className="w-4 h-4 text-[#C69C2E] animate-spin" />
                        )}
                        {callState.status === "connected" && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        )}
                        {(callState.status === "ended" || callState.status === "failed") && (
                            <PhoneOff className="w-4 h-4 text-red-500" />
                        )}
                        {isIncomingWaiting && (
                            <Phone className="w-4 h-4 text-[#C69C2E] animate-bounce" />
                        )}
                        <p className={`text-sm ${callState.status === "connected"
                            ? "text-green-400 font-mono"
                            : callState.status === "failed"
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}>
                            {getStatusText()}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        {showIncomingControls ? (
                            /* ── Incoming: Accept / Reject ── */
                            <>
                                <Button
                                    onClick={() => onRejectCall?.()}
                                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                                >
                                    <PhoneOff className="w-7 h-7" />
                                </Button>

                                <Button
                                    onClick={() => onAcceptCall?.()}
                                    className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 animate-pulse"
                                >
                                    <Phone className="w-7 h-7" />
                                </Button>
                            </>
                        ) : isOutgoingWaiting ? (
                            /* ── Outgoing: Waiting for callee, only Cancel/End ── */
                            <Button
                                onClick={handleClose}
                                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                            >
                                <PhoneOff className="w-7 h-7" />
                            </Button>
                        ) : (
                            /* ── Active call: Mute + End + Retry ── */
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleAudio}
                                    disabled={callState.status !== "connected"}
                                    className={`w-14 h-14 rounded-full transition-all ${callState.isAudioEnabled
                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                        : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                        }`}
                                >
                                    {callState.isAudioEnabled ? (
                                        <Mic className="w-6 h-6" />
                                    ) : (
                                        <MicOff className="w-6 h-6" />
                                    )}
                                </Button>

                                <Button
                                    onClick={handleClose}
                                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                                >
                                    <PhoneOff className="w-7 h-7" />
                                </Button>

                                {callState.status === "failed" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => startCall(targetUserId, targetUserName)}
                                        className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Phone className="w-6 h-6" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
