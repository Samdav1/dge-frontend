"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, Sparkles, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/ui/FallbackImage";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { resolveCategoryEmoji } from "@/features/marketplace/helpers";
import { listPublicServices } from "@/features/marketplace/actions";

interface CategoryInfo {
    id: string;
    name: string;
}

interface ServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    discount?: boolean;
    discount_percent?: number;
    type: string;
    image?: string;
    status?: string;
    username?: string;
    categories?: CategoryInfo[];
    profile?: {
        first_name?: string;
        last_name?: string;
        avatar?: string;
    };
}

const POPULAR_TAGS = [
    "Plumbing",
    "Web Dev",
    "Cleaning"
];

export function LandingSearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounced live search
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setIsLoading(false);
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const response = await listPublicServices({ search: trimmed, limit: 20 });
                if (response.success && Array.isArray(response.data)) {
                    setResults(response.data);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error("Error searching services:", err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on click outside or Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleExecuteSearch = (searchQuery?: string) => {
        const target = (searchQuery !== undefined ? searchQuery : query).trim();
        const targetUrl = target ? `/dashboard/marketplace?search=${encodeURIComponent(target)}` : "/dashboard/marketplace";
        if (typeof window !== "undefined") {
            sessionStorage.setItem("redirect_after_login", targetUrl);
        }
        setIsOpen(false);
        router.push(targetUrl);
    };

    const handleSelectService = (serviceId: string) => {
        const targetUrl = `/dashboard/marketplace/${serviceId}`;
        if (typeof window !== "undefined") {
            sessionStorage.setItem("redirect_after_login", targetUrl);
        }
        setIsOpen(false);
        router.push(targetUrl);
    };

    const formatPrice = (amount: number, discount?: boolean, discountPercent: number = 0) => {
        const final = discount && discountPercent > 0 ? amount - (amount * discountPercent / 100) : amount;
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(final);
    };

    return (
        <div ref={searchRef} className="w-full max-w-2xl mx-auto relative px-1 sm:px-2 md:px-0">
            {/* Search Input Box */}
            <div className="relative flex items-center group shadow-2xl rounded-xl sm:rounded-2xl bg-white text-black border border-gray-100 focus-within:ring-2 focus-within:ring-[#C69C2E]/60 transition-all w-full overflow-hidden">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleExecuteSearch();
                        }
                    }}
                    placeholder="Search for any service..."
                    className="w-full h-12 sm:h-14 md:h-16 pl-3 sm:pl-6 md:pl-8 pr-20 sm:pr-28 md:pr-32 rounded-xl sm:rounded-2xl bg-transparent border-0 text-black shadow-none text-xs sm:text-base md:text-lg placeholder:text-gray-400 focus-visible:ring-0 truncate"
                />

                {/* Right Input Action Controls */}
                <div className="absolute right-1.5 sm:right-2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setResults([]);
                                setIsOpen(false);
                            }}
                            className="p-1 sm:p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    )}

                    <Button
                        size="icon"
                        onClick={() => handleExecuteSearch()}
                        className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg sm:rounded-xl bg-[#C69C2E] hover:bg-[#B58B1D] text-white shadow-md transition-transform active:scale-95 shrink-0 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Minimal Popular Search Tags */}
            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap text-[10px] text-gray-200">
                <span className="flex items-center gap-1 font-medium text-[#C69C2E] shrink-0 text-[9px] sm:text-[10px]">
                    <Sparkles className="w-3 h-3 text-[#C69C2E]" /> Popular:
                </span>
                {POPULAR_TAGS.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => {
                            setQuery(tag);
                            handleExecuteSearch(tag);
                        }}
                        className="px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-[#C69C2E]/20 hover:text-[#C69C2E] border border-white/15 backdrop-blur-md transition-all text-[9px] sm:text-[10px] font-medium cursor-pointer shrink-0"
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Interactive Responsive Dropdown Results Overlay */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 z-50 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/90 dark:border-[#2A2A2A] shadow-2xl overflow-hidden text-left transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-[#1A1A1A]/80 border-b border-gray-100 dark:border-[#262626]">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-[#C69C2E]" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {isLoading
                                    ? "Searching marketplace..."
                                    : `Found ${results.length} service${results.length === 1 ? "" : "s"}`}
                            </span>
                        </div>
                        {results.length > 0 && (
                            <button
                                onClick={() => handleExecuteSearch()}
                                className="text-xs font-semibold text-[#C69C2E] hover:text-[#B58B1D] flex items-center gap-1 transition-colors"
                            >
                                View all results <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Results List */}
                    <div className={`divide-y divide-gray-100 dark:divide-[#222] p-1 md:p-2 ${
                        results.length > 10 
                            ? "max-h-[340px] md:max-h-[420px] overflow-y-auto" 
                            : "max-h-none overflow-y-visible"
                    }`}>
                        {isLoading ? (
                            <div className="p-6 text-center text-gray-400 space-y-3">
                                <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C69C2E]" />
                                <p className="text-xs md:text-sm font-medium">Searching for &quot;{query}&quot;...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-6 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#222] text-gray-400 flex items-center justify-center mx-auto">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        No services found matching &quot;{query}&quot;
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Try adjusting your keywords or browse all categories in our marketplace.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExecuteSearch("")}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-[#C69C2E] text-[#C69C2E] hover:bg-[#C69C2E] hover:text-white transition-colors"
                                >
                                    Explore Ecosystem
                                </Button>
                            </div>
                        ) : (
                            results.map((service) => {
                                const catName = service.categories && service.categories.length > 0
                                    ? service.categories[0].name
                                    : "";
                                const categoryEmoji = resolveCategoryEmoji("", catName);
                                const providerName = service.profile?.first_name
                                    ? `${service.profile.first_name} ${service.profile.last_name || ""}`.trim()
                                    : service.username || "Verified Professional";

                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => handleSelectService(service.id)}
                                        className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-all border border-transparent hover:border-gray-200 dark:hover:border-[#333] group cursor-pointer gap-2 sm:gap-3"
                                    >
                                        {/* Left Side: Thumbnail & Service Details */}
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                            {/* Service Image */}
                                            <div className="relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#202020]">
                                                <FallbackImage
                                                    src={getBackendImageUrl(service.image)}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate group-hover:text-[#C69C2E] transition-colors">
                                                    {service.name}
                                                </h4>

                                                {/* Category & Type badges */}
                                                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mt-0.5">
                                                    {catName && (
                                                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#252525] text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            <span>{categoryEmoji}</span>
                                                            <span className="truncate max-w-[80px] sm:max-w-none">{catName}</span>
                                                        </span>
                                                    )}

                                                    <span className="px-1.5 py-0.5 rounded bg-[#C69C2E]/10 text-[#C69C2E] text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                                        {service.type}
                                                    </span>
                                                </div>

                                                {/* Description or Provider */}
                                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 sm:mt-1">
                                                    By <span className="font-medium text-gray-700 dark:text-gray-300">{providerName}</span>
                                                    {service.description ? ` • ${service.description}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Price & Navigation Arrow */}
                                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-right">
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">
                                                    {formatPrice(service.price, service.discount, service.discount_percent || 0)}
                                                </div>
                                                {service.discount && service.discount_percent ? (
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1 py-0.5 rounded">
                                                        -{service.discount_percent}% OFF
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#C69C2E] group-hover:text-white transition-all text-gray-400 shrink-0">
                                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Dropdown Footer Button */}
                    {results.length > 0 && (
                        <div className="p-2.5 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-[#262626] text-center">
                            <button
                                onClick={() => handleExecuteSearch()}
                                className="w-full py-2.5 rounded-xl bg-[#C69C2E] hover:bg-[#B58B1D] text-white font-semibold text-xs md:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                            >
                                Explore all in the Ecosystem
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
