"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface CategorySearchPickerProps {
    categories: Category[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    maxVisible?: number;
}

export function CategorySearchPicker({
    categories = [],
    value,
    onChange,
    placeholder = "Select category",
    maxVisible = 10,
}: CategorySearchPickerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const showSearch = categories.length > maxVisible;

    // Only filter when there is an actual query typed — never return all on empty string
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return categories.filter((cat) => cat.name.toLowerCase().includes(q));
    }, [categories, searchQuery]);

    // Selected category name
    const selectedName = categories.find((c) => c.id === value)?.name;

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="space-y-3">
            {/* Selected indicator */}
            {selectedName && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Selected:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C69C2E]/10 border border-[#C69C2E]/30 text-[#C69C2E] font-semibold text-xs">
                        <Check className="w-3 h-3" />
                        {selectedName}
                    </span>
                </div>
            )}

            {/* Category chips — hidden while search is active to keep UI clean */}
            {!isSearchOpen && (
                <div className="flex flex-wrap gap-2">
                    {categories.slice(0, maxVisible).map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onChange(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer ${
                                value === cat.id
                                    ? "bg-[#C69C2E] text-white border-[#C69C2E] shadow-sm shadow-[#C69C2E]/20"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#C69C2E]/40 hover:bg-[#C69C2E]/5"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Search — only shown when there are more categories than maxVisible */}
            {showSearch && (
                <div>
                    {!isSearchOpen ? (
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="inline-flex items-center gap-2 text-xs text-[#C69C2E] hover:text-[#b08b29] font-medium transition-colors cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Search {categories.length - maxVisible} more categories...
                        </button>
                    ) : (
                        <div className="space-y-2">
                            {/* Search input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Type to search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#C69C2E]/40 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 focus:border-[#C69C2E]/60 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Results — ONLY appear after the user types something */}
                            {searchQuery.trim() ? (
                                <div className="border border-gray-200 rounded-xl bg-white shadow-lg max-h-52 overflow-y-auto">
                                    {filteredCategories.length > 0 ? (
                                        <>
                                            <p className="px-3 pt-2 pb-1.5 text-[10px] text-gray-400 font-medium sticky top-0 bg-white border-b border-gray-100">
                                                {filteredCategories.length} result{filteredCategories.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                                            </p>
                                            {filteredCategories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        onChange(cat.id);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                                                        value === cat.id
                                                            ? "bg-[#C69C2E]/10 text-[#C69C2E] font-semibold"
                                                            : "hover:bg-gray-50 text-gray-700"
                                                    }`}
                                                >
                                                    {cat.name}
                                                    {value === cat.id && <Check className="w-3.5 h-3.5 text-[#C69C2E] shrink-0" />}
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="px-4 py-6 text-center">
                                            <p className="text-sm text-gray-400">No categories match &ldquo;{searchQuery}&rdquo;</p>
                                            <p className="text-xs text-gray-300 mt-1">Try a different keyword</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Prompt user to type — never dump all 700+ categories at once */
                                <p className="text-xs text-gray-400 px-1 py-1">
                                    Start typing to search all {categories.length} available categories...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
