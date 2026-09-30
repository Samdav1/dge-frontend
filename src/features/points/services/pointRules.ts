"use client";

import { toast } from "sonner";
import { deductUserPoints } from "../actions";

const KEY_MARKETPLACE_FAILED = "dge_points_failed_marketplace";
const KEY_POSTED_JOB_FAILED = "dge_points_failed_posted_jobs";
const KEY_DRIVING_FAILED = "dge_points_failed_driving";
const LOCAL_POINTS_SPENT_KEY = "dge_points_local_spent";

export interface SpecialPointsPack {
    id: string;
    title: string;
    badge: string;
    nairaAmount: number;
    points: number;
    basePoints: number;
    bonusPoints: number;
    popular?: boolean;
    description: string;
}

/**
 * Promotional Points Packages configured according to platform rules:
 * - ₦2,000 gives 25 Points (+5 Bonus points)
 * - ₦3,000 gives 40 Points (+10 Bonus points)
 * - Plus quick starter and custom options
 */
export const SPECIAL_PROMO_PACKS: SpecialPointsPack[] = [
    {
        id: "starter_promo_200",
        title: "Starter Promo",
        badge: "Special Offer",
        nairaAmount: 200,
        points: 25,
        basePoints: 2,
        bonusPoints: 23,
        description: "Special intro promo: 25 Points for only ₦200",
    },
    {
        id: "popular_pack_2000",
        title: "Growth Pack",
        badge: "+5 Free Points",
        nairaAmount: 2000,
        points: 25,
        basePoints: 20,
        bonusPoints: 5,
        popular: true,
        description: "Buy ₦2,000 worth of points and get 25 DGE Points",
    },
    {
        id: "pro_pack_3000",
        title: "Power Pack",
        badge: "+10 Free Points",
        nairaAmount: 3000,
        points: 40,
        basePoints: 30,
        bonusPoints: 10,
        description: "Buy ₦3,000 worth of points and receive 40 DGE Points",
    },
];

/**
 * Get current failed negotiation count from localStorage
 */
export function getFailedAttempts(key: string): number {
    if (typeof window === "undefined") return 0;
    try {
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
        return 0;
    }
}

/**
 * Increment failed attempts count. If it hits 3, returns shouldDeduct: true and resets.
 */
export function incrementFailedAttempts(key: string): { count: number; shouldDeduct: boolean } {
    if (typeof window === "undefined") return { count: 0, shouldDeduct: false };
    try {
        const current = getFailedAttempts(key) + 1;
        if (current >= 3) {
            localStorage.setItem(key, "0");
            return { count: 3, shouldDeduct: true };
        } else {
            localStorage.setItem(key, current.toString());
            return { count: current, shouldDeduct: false };
        }
    } catch {
        return { count: 1, shouldDeduct: false };
    }
}

export function resetFailedAttempts(key: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, "0");
    } catch {
        // no-op
    }
}

/**
 * Deduct points locally and via server action
 */
export async function executePointDeduction(points: number, reason: string, meta?: any) {
    try {
        if (typeof window !== "undefined") {
            const currentSpent = parseInt(localStorage.getItem(LOCAL_POINTS_SPENT_KEY) || "0", 10) || 0;
            localStorage.setItem(LOCAL_POINTS_SPENT_KEY, (currentSpent + points).toString());
        }
        await deductUserPoints(points, reason, meta);
    } catch (e) {
        console.warn("Point deduction notice:", e);
    }
}

/**
 * 1. Marketplace Service:
 * When client and service provider reach an agreement and negotiation is accepted:
 * -> Client is deducted 1 point.
 */
export async function onMarketplaceNegotiationAccepted(isClient: boolean, negotiationId?: string) {
    if (isClient) {
        await executePointDeduction(1, "Accepted Marketplace Service Negotiation", { negotiationId, role: "client" });
        toast.info("1 DGE Point deducted for accepted service negotiation.");
    }
}

/**
 * 1b. Marketplace Service:
 * If client chats/inquires with up to 3 service providers without reaching agreement:
 * -> Client is deducted 1 point.
 */
export async function onMarketplaceNegotiationFailed(isClient: boolean) {
    if (!isClient) return;
    const { count, shouldDeduct } = incrementFailedAttempts(KEY_MARKETPLACE_FAILED);
    if (shouldDeduct) {
        await executePointDeduction(1, "3 Unagreed Marketplace Inquiries", { count: 3, role: "client" });
        toast.warning("1 DGE Point deducted (3 inquiries with service providers without reaching agreement).");
    } else {
        toast.info(`Negotiation closed (${count}/3 unagreed attempts before 1-point fair-use deduction).`);
    }
}

/**
 * 2. Posted Job (Job Board):
 * Service provider is the one applying/bidding.
 * When service provider's bid is accepted:
 * -> Service provider is deducted 1 point.
 */
export async function onPostedJobBidAccepted(isServiceProvider: boolean, jobId?: string) {
    if (isServiceProvider) {
        await executePointDeduction(1, "Accepted Job Board Bid", { jobId, role: "service_provider" });
        toast.info("1 DGE Point deducted for accepted job application.");
    }
}

/**
 * 2b. Posted Job:
 * If service provider applies for up to 3 jobs without any bid being accepted:
 * -> Service provider is deducted 1 point.
 */
export async function onPostedJobBidFailed(isServiceProvider: boolean) {
    if (!isServiceProvider) return;
    const { count, shouldDeduct } = incrementFailedAttempts(KEY_POSTED_JOB_FAILED);
    if (shouldDeduct) {
        await executePointDeduction(1, "3 Unaccepted Posted Job Applications", { count: 3, role: "service_provider" });
        toast.warning("1 DGE Point deducted (3 posted job applications without agreement).");
    } else {
        toast.info(`Application unaccepted (${count}/3 before 1-point fair-use deduction).`);
    }
}

/**
 * 3. Driving System:
 * Both parties (passenger & driver) get deducted 1 point on successful negotiation.
 */
export async function onDrivingNegotiationAccepted(tripId?: string) {
    await executePointDeduction(1, "Agreed Ride Negotiation", { tripId, context: "driving_negotiation_success" });
    toast.info("1 DGE Point deducted for agreed ride negotiation.");
}

/**
 * 3b. Driving System:
 * If passenger or driver has up to 3 failed ride negotiations:
 * -> Deduct 1 point from both parties.
 */
export async function onDrivingNegotiationFailed() {
    const { count, shouldDeduct } = incrementFailedAttempts(KEY_DRIVING_FAILED);
    if (shouldDeduct) {
        await executePointDeduction(1, "3 Failed Ride Negotiations", { count: 3, context: "driving_negotiation_failed" });
        toast.warning("1 DGE Point deducted (3 unagreed ride offers).");
    } else {
        toast.info(`Offer declined (${count}/3 unagreed offers before 1-point fair-use deduction).`);
    }
}

/**
 * 4. Driving System Service Completion:
 * When the ride/service is completely finished:
 * -> Client is deducted 2 points.
 */
export async function onTripCompleted(isClient: boolean, tripId?: string) {
    if (isClient) {
        await executePointDeduction(2, "Completed Ride / Service", { tripId, context: "trip_completed" });
        toast.success("Ride completed successfully! 2 DGE Points deducted.");
    }
}
