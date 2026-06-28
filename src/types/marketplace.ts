export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: boolean;
    discount_percent: number;
    type: string;
    status: string;
    image: string;
    created_at: string;
    keywords: string;
    username: string;
    user_id: string;
    upvotes: number;
    user_online: boolean;
    user_picture?: string | null;
    categories?: { id: string; name: string }[];
}

export interface UserProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    bio: string;
    phone: string;
    avatar_url: string;
    country: string;
    state: string;
    city: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    gender: string;
    date_of_birth?: string | null;
    created_at: string;
    updated_at: string;
}

export interface PortfolioItem {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    visibility: string;
    website?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    username: string;
    email: string;
    id: string;
    status: string;
    referral_code: string;
}

export interface ServiceDetailResponse {
    service: Service;
    profile: UserProfile;
    portfolio: PortfolioItem[];
    user: User;
}

export interface ServiceResponseItem {
    service: Service;
    profile: UserProfile | null;
    portfolio: PortfolioItem[];
    user: User;
}

export enum EscrowStatus {
    held = "held",
    released = "released",
    refunded = "refunded",
    disputed = "disputed",
}

export interface WorkSubmission {
    id: string;
    user_id: string;
    escrow_id: string;
    service_id: string;
    text?: string;
    links?: string[];
    image_urls?: string[];
    file_urls?: string[];
    created_at: string;
    service?: Service;
}

export interface Wallet {
    id: string;
    user_id: string;
    wallet_type: string;
    balance_cents: number;
    currency: string;
}

export interface Escrow {
    id: string;
    payer_wallet_id: string;
    payee_wallet_id: string;
    payment_negotiation_id: string;
    amount_cents: number;
    status: EscrowStatus;
    created_at: string;
    updated_at: string;
    price_negotiation?: PriceNegotiation;
    submissions?: WorkSubmission[];
    payer_wallet?: Wallet;
    payee_wallet?: Wallet;
}

export enum NegotiationStatus {
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected",
    countered = "countered",
}

export interface PriceNegotiation {
    id: string;
    service_id: string;
    initiator_id: string;
    receiver_id: string;
    negotiation_type: "incoming" | "outgoing";
    proposed_price_cents: number;
    message?: string;
    status: NegotiationStatus;
    created_at: string;
    updated_at: string;
    services?: Service;
    initiator?: User;
    receiver?: User;
}

export interface EscrowDetailResponse {
    escrow: Escrow;
    negotiation: PriceNegotiation;
    service: Service;
    client: User;
    provider: User;
    clientProfile: UserProfile | null;
    providerProfile: UserProfile | null;
}
