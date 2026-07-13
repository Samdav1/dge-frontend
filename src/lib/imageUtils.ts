// Utility function to get full image URL from backend
export function getBackendImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath) {
        return `data:image/svg+xml;utf8,<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23f9fafb" /><g transform="translate(200, 150)"><circle cx="-45" cy="-5" r="24" fill="none" stroke="%23C69C2E" stroke-width="3" /><text x="-45" y="4" font-family="sans-serif" font-weight="bold" font-size="26" fill="%23C69C2E" text-anchor="middle">D</text><text x="-10" y="5" font-family="sans-serif" font-weight="bold" font-size="36" fill="%23C69C2E" text-anchor="start" letter-spacing="1">DGE</text></g></svg>`;
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // Prepend the proxy or backend URL
    const isClient = typeof window !== "undefined";
    const prefix = isClient ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

    const cleanImagePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${prefix}${cleanImagePath}`;
}
