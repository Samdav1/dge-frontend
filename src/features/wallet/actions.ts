"use server"

import { redirect } from "next/navigation";
import { auth } from "@/auth"

// Helper function to get auth headers
async function getAuthHeaders() {
    const session = await auth();

    if (!session || !session.backendToken || (session as any).error === "RefreshAccessTokenError") {
        redirect("/login");
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    return {
        "Authorization": `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY || "",
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Create Wallet
export async function createWallet() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/wallets/create_wallet`, {
            method: "POST",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create wallet" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Create wallet error:", error);
        return { success: false, error: "Network error" };
    }
}

// Update Wallet (deposit/withdrawal)
export async function updateWallet(walletType: "deposit" | "earnings", amount: number) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/wallets/update_wallet?wallet_type=${walletType}&amount=${amount}`, {
            method: "PATCH",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update wallet" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Update wallet error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get User Transactions
export async function getUserTransactions() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/transactions/transactions/user/`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch transactions" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get transactions error:", error);
        return { success: false, error: "Network error" };
    }
}

// Create Transaction
export async function createTransaction(data: {
    wallet_id: string;
    users_id: string;
    type: "deposit" | "withdrawal" | "transfer" | "payment" | "refund" | "escrow_release";
    amount_cents: number;
    reference?: string;
    status: "pending" | "completed" | "failed" | "reversed";
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/transactions/transactions/`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create transaction" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Create transaction error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get User Wallet
export async function getUserWallet() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/wallets/get_user_wallet`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch wallet" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get wallet error:", error);
        return { success: false, error: "Network error" };
    }
}

// ─── Payment Actions ──────────────────────────────────────────────────────────

// Get supported banks list
export async function getBanksList() {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/banks`, { method: "GET", headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to fetch banks" };
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

// Verify a bank account number (name enquiry)
export async function verifyBankAccount(accountNumber: string, bankCode: string) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/bank-account/verify`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Verification failed" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Save a verified bank account
export async function saveBankAccount(payload: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
    is_default?: boolean;
}) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/bank-account`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to save bank account" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Get all saved bank accounts
export async function getSavedBankAccounts() {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/bank-account`, { method: "GET", headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to fetch bank accounts" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Delete a saved bank account
export async function deleteBankAccount(accountId: string) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/bank-account/${accountId}`, { method: "DELETE", headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to delete bank account" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Initiate a deposit (get Monnify payment link)
export async function initiateDeposit(amountNaira: number) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/deposit/initiate`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amountNaira }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to initiate deposit" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Verify a deposit payment with Monnify (call after user completes payment)
export async function verifyDeposit(depositId: string) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/deposit/verify/${depositId}`, {
            method: "POST",
            headers,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Verification failed" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Get deposit history
export async function getDepositHistory() {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/deposit/history`, { method: "GET", headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to fetch deposit history" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Request a withdrawal from earnings wallet
export async function requestWithdrawal(amountNaira: number, bankAccountId: string) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/withdrawal/request`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amountNaira, bank_account_id: bankAccountId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to request withdrawal" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// Get withdrawal history
export async function getWithdrawalHistory() {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };
    try {
        const response = await fetch(`${apiUrl}/payments/withdrawal/history`, { method: "GET", headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, error: data.detail || "Failed to fetch withdrawal history" };
        return { success: true, data };
    } catch {
        return { success: false, error: "Network error" };
    }
}
