"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, SlidersHorizontal, Loader2 } from "lucide-react";

import { getCategoryEmoji, resolveCategoryEmoji } from "@/features/marketplace/helpers";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/marketplace/hooks/useMarketplace";
import { useDebounce } from "@/hooks/useDebounce";
import { CategorySection } from "@/features/marketplace/components/CategorySection";

const prioritizeCategories = (cats: any[]) => {
    const priorityKeywords = [
        "chef",
        "home service",
        "cater",     // matches caterer, catering, catery
        "clean",     // cleaning is popular
        "mechanic",  // mechanic/auto is popular
        "handyman",  // handyman is popular
        "electric",  // electrician
        "plumb",     // plumber
    ];

    return [...cats].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        let indexA = priorityKeywords.findIndex(kw => nameA.includes(kw));
        let indexB = priorityKeywords.findIndex(kw => nameB.includes(kw));

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return nameA.localeCompare(nameB);
    });
};

export default function EcosystemPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [clickedCategoryId, setClickedCategoryId] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    // Filtered and prioritized categories for the grid view
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        let list = categories;
        if (debouncedSearchTerm.trim()) {
            const q = debouncedSearchTerm.toLowerCase();
            list = categories.filter((cat: any) => cat.name.toLowerCase().includes(q));
        }
        return prioritizeCategories(list);
    }, [categories, debouncedSearchTerm]);

    const handleCategorySelect = (catId: string) => {
        setSearchTerm("");
        if (selectedCategory === "all") {
            setClickedCategoryId(catId);
        } else {
            setSelectedCategory(catId);
            setClickedCategoryId(null);
        }
    };

    const activeCategoryId = selectedCategory !== "all" ? selectedCategory : clickedCategoryId;

    const activeCategoryData = useMemo(() => {
        if (!activeCategoryId || !categories) return null;
        return (categories as any[]).find((cat: any) => cat.id === activeCategoryId) || null;
    }, [activeCategoryId, categories]);

    const selectedCategoryData = useMemo(() => {
        if (selectedCategory === "all" || !categories) return null;
        return (categories as any[]).find((cat: any) => cat.id === selectedCategory) || null;
    }, [selectedCategory, categories]);

    return (
        <div className="space-y-6 md:space-y-8 pb-12 max-w-7xl mx-auto">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Ecosystem</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover top-rated services and talented professionals in our network.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100/80 dark:bg-[#1A1A1A] px-4 py-2 rounded-full w-fit">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-[#C69C2E]">Ecosystem</span>
                    </div>
                </div>
            </div>

            {/* Back button and title for specific category view */}
            {selectedCategory !== "all" && (
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2A2A2A] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Back to Ecosystem
                    </button>
                    {selectedCategoryData && (
                        <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                            Browsing: {selectedCategoryData.name}
                        </h2>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-[#141414] p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-[#2A2A2A] flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <Input
                        placeholder={selectedCategory === "all" ? "Search categories..." : "Search for any service..."}
                        className="pl-12 h-12 bg-gray-50/50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] rounded-xl w-full text-base focus-visible:ring-[#C69C2E] dark:text-white dark:placeholder:text-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    {/* Category quick filter (only show if already in a category to switch quickly) */}
                    {selectedCategory !== "all" && (
                        <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 rounded-xl bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] focus:ring-[#C69C2E] text-xs sm:text-sm dark:text-gray-200">
                                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#C69C2E]" />
                                    <span className="truncate text-xs sm:text-sm">
                                        {selectedCategoryData?.name ?? "Category"}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="dark:bg-[#141414] dark:border-[#2A2A2A]">
                                <SelectItem value="all" className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">All Categories</SelectItem>
                                {categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id} className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Type filter (only relevant when viewing services) */}
                    {selectedCategory !== "all" && (
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 rounded-xl bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2A2A2A] focus:ring-[#C69C2E] text-xs sm:text-sm dark:text-gray-200">
                                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#C69C2E]" />
                                    <span className="truncate"><SelectValue placeholder="Type" /></span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="dark:bg-[#141414] dark:border-[#2A2A2A]">
                                <SelectItem value="all" className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">All Types</SelectItem>
                                <SelectItem value="physical" className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">Physical</SelectItem>
                                <SelectItem value="online" className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">Online</SelectItem>
                                <SelectItem value="hybrid" className="dark:text-gray-200 dark:focus:bg-[#1A1A1A]">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>
            {categoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#C69C2E]" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading ecosystem...</p>
                </div>
            ) : (
                <div className="space-y-12 md:space-y-16">
                    {/* View All Categories Grid */}
                    <div className={selectedCategory === "all" ? "block" : "hidden"}>
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6">
                             {filteredCategories.map((cat: any, i: number) => {
                                 const categoryEmoji = resolveCategoryEmoji(cat.icon, cat.name);
                                 const isLoading = clickedCategoryId === cat.id;
                                 return (
                                     <button
                                         key={cat.id}
                                         onClick={() => handleCategorySelect(cat.id)}
                                         disabled={clickedCategoryId !== null}
                                         className={`group relative flex flex-col items-center gap-2 md:gap-3 p-2 py-4 md:p-6 rounded-2xl transition-all duration-300 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2A2A2A] ${
                                             isLoading 
                                                 ? "border-[#C69C2E] shadow-xl shadow-[#C69C2E]/5 ring-2 ring-[#C69C2E]/20 scale-95 opacity-80 cursor-wait" 
                                                 : "cursor-pointer hover:border-[#C69C2E]/40 hover:shadow-xl hover:shadow-[#C69C2E]/5 hover:-translate-y-1"
                                         }`}
                                     >
                                         {/* Service Count Badge */}
                                         <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-50 dark:bg-[#1A1A1A] text-gray-400 dark:text-gray-500 group-hover:bg-[#C69C2E] group-hover:text-black border border-gray-100 dark:border-[#252525] group-hover:border-transparent transition-all duration-300">
                                             {cat.service_count !== undefined && cat.service_count > 50 ? "50+" : cat.service_count ?? 0}
                                         </div>

                                         <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#C69C2E]/10 border border-[#C69C2E]/20">
                                             {isLoading ? (
                                                 <Loader2 className="h-5 w-5 md:h-8 md:w-8 text-[#C69C2E] animate-spin" />
                                             ) : (
                                                 <span className="text-xl md:text-3xl leading-none">{categoryEmoji}</span>
                                             )}
                                         </div>
                                         <span className="text-[10px] md:text-base font-semibold text-center leading-tight text-gray-800 dark:text-gray-100 group-hover:text-[#C69C2E] transition-colors line-clamp-2 md:line-clamp-none">
                                             {isLoading ? "Loading..." : cat.name}
                                         </span>
                                     </button>
                                 );
                             })}
                            
                            {filteredCategories.length === 0 && (
                                <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-[#141414] rounded-3xl border border-gray-100 dark:border-[#2A2A2A]">
                                    <Search className="w-10 h-10 mx-auto mb-4 text-gray-400 opacity-50" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Categories Found</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View Specific Category Services */}
                    <div className={selectedCategory !== "all" ? "block" : "hidden"}>
                        {(selectedCategory !== "all" || clickedCategoryId) && (
                            <CategorySection 
                                categoryId={selectedCategory !== "all" ? selectedCategory : clickedCategoryId!} 
                                title={selectedCategoryData?.name || activeCategoryData?.name || ""} 
                                searchTerm={debouncedSearchTerm} 
                                type={selectedType} 
                                initialLimit={20}
                                showEmptyState={true}
                                onLoadComplete={() => {
                                    if (clickedCategoryId) {
                                        setSelectedCategory(clickedCategoryId);
                                        setClickedCategoryId(null);
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
