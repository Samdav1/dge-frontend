"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CallState, CallStatus } from "../call-types";
import { getAgoraToken, getCallUserId } from "../call-actions";
import { createCallSession, updateCallStatus } from "../call-api";

// Agora SDK — imported dynamically to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgoraClient = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IMicrophoneAudioTrack = any;

interface UseAgoraCallOptions {
    onCallEnded?: () => void;
    onError?: (error: string) => void;
}

export function useAgoraCall(options: UseAgoraCallOptions = {}) {
    const { onCallEnded, onError } = options;

    const [callState, setCallState] = useState<CallState>({
        status: "idle",
        isAudioEnabled: true,
        remoteUserId: null,
        remoteUserName: null,
        error: null,
        callDuration: 0,
    });

    const clientRef = useRef<AgoraClient>(null);
    const localTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callSessionIdRef = useRef<string | null>(null);
    const channelRef = useRef<string | null>(null);
    const appIdRef = useRef<string | null>(null);
    const renewalTimerRef = useRef<NodeJS.Timeout | null>(null);
    const eventsRegisteredRef = useRef(false);
    const endCallRef = useRef<(() => Promise<void>) | null>(null);

    // ── helpers ────────────────────────────────────────────────────────────

    const updateStatus = useCallback((status: CallStatus, error?: string) => {
        console.log(`[useAgoraCall] status → ${status}`, error || "");
        setCallState((prev) => ({ ...prev, status, error: error ?? null }));
    }, []);

    const startCallTimer = useCallback(() => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        setCallState((prev) => ({ ...prev, callDuration: 0 }));
        callTimerRef.current = setInterval(() => {
            setCallState((prev) => ({ ...prev, callDuration: prev.callDuration + 1 }));
        }, 1000);
    }, []);

    const stopCallTimer = useCallback(() => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    }, []);

    const stopRenewalTimer = useCallback(() => {
        if (renewalTimerRef.current) {
            clearTimeout(renewalTimerRef.current);
            renewalTimerRef.current = null;
        }
    }, []);

    // ── startCall ─────────────────────────────────────────────────────────

    const startCall = useCallback(async (
        channelName: string,
        targetUserName?: string,
    ): Promise<boolean> => {
        try {
            console.log("[useAgoraCall] ===== START CALL =====");
            console.log("[useAgoraCall] channelName:", channelName);

            updateStatus("joining");
            setCallState((prev) => ({
                ...prev,
                remoteUserName: targetUserName ?? null,
            }));

            // ── Step 1: Fetch Agora token from backend ───────────────────
            console.log("[useAgoraCall] Step 1: Fetching token...");
            const tokenData = await getAgoraToken(channelName);
            if (!tokenData) {
                console.error("[useAgoraCall] Step 1 FAILED: token is null");
                updateStatus("failed", "Could not get call token from server");
                onError?.("Could not get call token");
                return false;
            }
            console.log("[useAgoraCall] Step 1 OK: token received, app_id:", tokenData.app_id?.substring(0, 8) + "...");

            appIdRef.current = tokenData.app_id;
            channelRef.current = channelName;

            // ── Step 2: Import Agora SDK and create client ───────────────
            console.log("[useAgoraCall] Step 2: Loading Agora SDK...");
            let AgoraRTC;
            try {
                AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
                console.log("[useAgoraCall] Step 2 OK: Agora SDK loaded");
            } catch (sdkErr) {
                console.error("[useAgoraCall] Step 2 FAILED: Could not load Agora SDK", sdkErr);
                updateStatus("failed", "Failed to load call engine");
                onError?.("Failed to load call engine");
                return false;
            }

            // Create client if needed
            if (!clientRef.current) {
                clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
                console.log("[useAgoraCall] Created new Agora client");
            }
            const client = clientRef.current;

            // Prevent duplicate join if already connecting or connected
            if (client.connectionState !== "DISCONNECTED") {
                console.warn(`[useAgoraCall] Client is already in ${client.connectionState} state. Skipping join.`);
                if (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING") {
                    if (client.connectionState === "CONNECTED") {
                        updateStatus("connected");
                    }
                    return true;
                }
                return false;
            }

            // ── Step 3: Wire event handlers (only once per client) ───────
            if (!eventsRegisteredRef.current) {
                console.log("[useAgoraCall] Step 3: Registering event handlers...");

                client.on("user-published", async (user: any, mediaType: string) => {
                    console.log("[useAgoraCall] EVENT: user-published", user.uid, mediaType);
                    if (mediaType !== "audio") return;
                    try {
                        await client.subscribe(user, mediaType);
                        user.audioTrack?.play();
                        console.log("[useAgoraCall] Subscribed + playing remote audio for uid:", user.uid);
                        setCallState((prev) => ({
                            ...prev,
                            status: "connected",
                            remoteUserId: String(user.uid),
                        }));
                    } catch (subErr) {
                        console.error("[useAgoraCall] Failed to subscribe to remote user", subErr);
                    }
                });

                client.on("user-unpublished", (user: any) => {
                    console.log("[useAgoraCall] EVENT: user-unpublished", user.uid);
                });

                client.on("user-left", (user: any) => {
                    console.log("[useAgoraCall] EVENT: user-left", user.uid);
                    // Automatically end call if the remote user leaves
                    if (endCallRef.current) {
                        endCallRef.current();
                    }
                });

                client.on("token-privilege-will-expire", async () => {
                    console.log("[useAgoraCall] EVENT: token-privilege-will-expire");
                    if (!channelRef.current) return;
                    const renewed = await getAgoraToken(channelRef.current);
                    if (renewed) {
                        await client.renewToken(renewed.token);
                        console.log("[useAgoraCall] Token renewed OK");
                    }
                });

                client.on("connection-state-change", (curState: string, revState: string) => {
                    console.log(`[useAgoraCall] EVENT: connection-state-change ${revState} → ${curState}`);
                });

                eventsRegisteredRef.current = true;
                console.log("[useAgoraCall] Step 3 OK: Event handlers registered");
            }

            // ── Step 4: Join the channel ─────────────────────────────────
            console.log("[useAgoraCall] Step 4: Joining channel...");
            console.log("[useAgoraCall]   app_id:", tokenData.app_id);
            console.log("[useAgoraCall]   channel:", channelName);
            console.log("[useAgoraCall]   token:", tokenData.token?.substring(0, 20) + "...");
            console.log("[useAgoraCall]   uid:", tokenData.uid);

            try {
                const assignedUid = await client.join(
                    tokenData.app_id,
                    channelName,
                    tokenData.token,
                    tokenData.uid || null
                );
                console.log("[useAgoraCall] Step 4 OK: Joined channel! assignedUid:", assignedUid);
            } catch (joinErr: any) {
                console.error("[useAgoraCall] Step 4 FAILED: Join error:", joinErr);
                updateStatus("failed", `Failed to join channel: ${joinErr?.message || joinErr}`);
                onError?.(`Failed to join: ${joinErr?.message || joinErr}`);
                return false;
            }

            // ── Step 5: Mic track + publish ──────────────────────────────
            console.log("[useAgoraCall] Step 5: Creating mic track...");
            try {
                const localTrackPromise = AgoraRTC.createMicrophoneAudioTrack();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Microphone initialization timeout")), 5000)
                );
                const localTrack = await Promise.race([localTrackPromise, timeoutPromise]);
                localTrackRef.current = localTrack;
                console.log("[useAgoraCall] Step 5a OK: Mic track created");

                await client.publish([localTrack]);
                console.log("[useAgoraCall] Step 5b OK: Mic track published");
            } catch (micErr: any) {
                console.error("[useAgoraCall] Step 5 FAILED:", micErr);
                // Don't fail the whole call just because mic access was denied or timed out
                // The user can still listen
                console.warn("[useAgoraCall] Continuing without microphone");
            }

            // ── Step 6: Mark connected ───────────────────────────────────
            console.log("[useAgoraCall] ===== CALL CONNECTED =====");
            updateStatus("connected");
            startCallTimer();

            // ── Step 7: Best-effort backend session logging ──────────────
            // Fire and forget — don't block the call flow
            createCallSession(null, "audio", channelName)
                .then((session) => {
                    if (session) {
                        callSessionIdRef.current = session.id;
                        console.log("[useAgoraCall] Backend session created:", session.id);
                    }
                })
                .catch((err) => console.warn("[useAgoraCall] Backend session create failed (non-blocking):", err));

            // ── Step 8: Schedule token renewal ───────────────────────────
            const renewIn = Math.max((tokenData.expires_in - 60) * 1000, 5000);
            renewalTimerRef.current = setTimeout(async () => {
                if (!channelRef.current) return;
                const renewed = await getAgoraToken(channelRef.current);
                if (renewed && clientRef.current) {
                    await clientRef.current.renewToken(renewed.token);
                }
            }, renewIn);

            return true;
        } catch (err: any) {
            console.error("[useAgoraCall] UNEXPECTED ERROR:", err);
            const errorMessage = err?.message || err?.toString() || "Unknown error";
            updateStatus("failed", `Failed: ${errorMessage}`);
            onError?.(`Failed to start call: ${errorMessage}`);
            return false;
        }
    }, [updateStatus, startCallTimer, onError]);

    // ── endCall ───────────────────────────────────────────────────────────

    const isEndingRef = useRef(false);

    const endCall = useCallback(async () => {
        if (callState.status === "idle" || callState.status === "ended") return;
        if (isEndingRef.current) return;

        isEndingRef.current = true;
        console.log("[useAgoraCall] ===== END CALL =====");
        stopCallTimer();
        stopRenewalTimer();

        // Update backend session status (best effort)
        if (callSessionIdRef.current) {
            updateCallStatus(callSessionIdRef.current, "ended").catch(() => { });
        }

        // Stop local audio track
        if (localTrackRef.current) {
            localTrackRef.current.stop();
            localTrackRef.current.close();
            localTrackRef.current = null;
        }

        // Leave channel
        if (clientRef.current) {
            try {
                await clientRef.current.leave();
            } catch { /* ignore */ }
            try {
                clientRef.current.removeAllListeners();
            } catch { /* ignore */ }
            eventsRegisteredRef.current = false; // Reset so events are re-registered for next call
        }

        callSessionIdRef.current = null;
        channelRef.current = null;
        appIdRef.current = null;

        setCallState({
            status: "idle",
            isAudioEnabled: true,
            remoteUserId: null,
            remoteUserName: null,
            error: null,
            callDuration: 0,
        });

        onCallEnded?.();

        setTimeout(() => {
            isEndingRef.current = false;
        }, 500); // 500ms debounce
    }, [stopCallTimer, stopRenewalTimer, onCallEnded, callState.status]);

    // ── toggleAudio ───────────────────────────────────────────────────────

    const toggleAudio = useCallback(() => {
        if (!localTrackRef.current) return;
        const enabled = !localTrackRef.current.enabled;
        localTrackRef.current.setEnabled(enabled);
        setCallState((prev) => ({ ...prev, isAudioEnabled: enabled }));
    }, []);

    // ── cleanup on unmount ─────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            stopCallTimer();
            stopRenewalTimer();
            localTrackRef.current?.stop();
            localTrackRef.current?.close();
            if (clientRef.current) {
                clientRef.current.leave().catch(() => { });
                try {
                    clientRef.current.removeAllListeners();
                } catch { /* ignore */ }
            }
        };
    }, [stopCallTimer, stopRenewalTimer]);

    // ── update endCall ref ────────────────────────────────────────────────
    useEffect(() => {
        endCallRef.current = endCall;
    }, [endCall]);

    return {
        callState,
        startCall,
        endCall,
        toggleAudio,
    };
}
