"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
    Search, SlidersHorizontal, Loader2, Grid3X3, X, ChevronRight, ArrowLeft,
    Laptop, Paintbrush, PenTool, Code, Camera, Video, Music, 
    Briefcase, Wrench, Home, Car, Scissors, Heart, BookOpen, 
    Coffee, ShoppingBag, Globe, Smartphone, BarChart, Shield
} from "lucide-react";

// Helper function to get an emoji based on category name
const getCategoryEmoji = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    // Tech & Coding / Web / IT
    if (name.includes('web') || name.includes('dev') || name.includes('code') || name.includes('tech') || name.includes('software') || name.includes('computer') || name.includes('network') || name.includes('it consultant') || name.includes('database') || name.includes('cloud') || name.includes('sysadmin') || name.includes('wi-fi') || name.includes('wifi') || name.includes('server') || name.includes('pos system') || name.includes('cable') || name.includes('printer') || name.includes('game console') || name.includes('cybersecurity') || name.includes('data recovery')) return '💻';

    // Home Maintenance, Handyman, Construction & Trades
    if (name.includes('plumb')) return '🪠';
    if (name.includes('electrician') || name.includes('electrical')) return '⚡';
    if (name.includes('hvac') || name.includes('air conditioning') || name.includes('heating')) return '❄️';
    if (name.includes('painter') || name.includes('painting')) return '🖌️';
    if (name.includes('roofer') || name.includes('roofing')) return '🏠';
    if (name.includes('carpenter') || name.includes('carpentry')) return '🔨';
    if (name.includes('locksmith')) return '🔑';
    if (name.includes('pest') || name.includes('exterminator')) return '🪳';
    if (name.includes('appliance repair') || name.includes('appliance delivery')) return '🔌';
    if (name.includes('masonry') || name.includes('mason')) return '🧱';
    if (name.includes('flooring') || name.includes('floor')) return '🪵';
    if (name.includes('tile setter') || name.includes('tile and grout')) return '🧱';
    if (name.includes('drywall') || name.includes('insulation') || name.includes('foundation') || name.includes('glass installer') || name.includes('awning') || name.includes('gutter') || name.includes('chimney') || name.includes('demolition') || name.includes('waterproofing') || name.includes('soundproofing')) return '🛠️';
    if (name.includes('solar')) return '☀️';

    // Cleaning Services
    if (name.includes('clean') || name.includes('janitor') || name.includes('washer') || name.includes('wash') || name.includes('trash') || name.includes('waste') || name.includes('odor removal') || name.includes('hoarding') || name.includes('biohazard') || name.includes('dust')) return '🧹';

    // Automotive & Vehicles
    if (name.includes('mechanic') || name.includes('auto') || name.includes('towing') || name.includes('tire') || name.includes('windshield') || name.includes('motorcycle') || name.includes('boat') || name.includes('rv') || name.includes('battery jump') || name.includes('car wash') || name.includes('dent') || name.includes('fleet') || name.includes('truck') || name.includes('heavy equipment')) return '🚗';

    // Landscaping & Outdoors
    if (name.includes('lawn') || name.includes('garden') || name.includes('tree') || name.includes('arborist') || name.includes('snow removal') || name.includes('fence') || name.includes('sprinkler') || name.includes('landscape') || name.includes('weed') || name.includes('stump') || name.includes('pond') || name.includes('patio') || name.includes('deck') || name.includes('shed') || name.includes('greenhouse') || name.includes('soil') || name.includes('plant') || name.includes('bee')) return '🌱';

    // Moving, Transport & Delivery
    if (name.includes('mover') || name.includes('moving') || name.includes('furniture assembler') || name.includes('junk') || name.includes('courier') || name.includes('delivery') || name.includes('freight') || name.includes('driver') || name.includes('transport') || name.includes('haul') || name.includes('valet') || name.includes('chauffeur') || name.includes('pilot') || name.includes('dispatch') || name.includes('baggage')) return '📦';

    // Design, Writing & Creative Art
    if (name.includes('design') || name.includes('art') || name.includes('illustrator') || name.includes('animator') || name.includes('creative') || name.includes('interior') || name.includes('stager') || name.includes('curator')) return '🎨';
    if (name.includes('write') || name.includes('content') || name.includes('copy') || name.includes('translate') || name.includes('proofread') || name.includes('resume') || name.includes('blog') || name.includes('edit') || name.includes('transcription') || name.includes('interpreter')) return '✍️';
    if (name.includes('photo') || name.includes('camera') || name.includes('photographer')) return '📸';
    if (name.includes('video') || name.includes('film') || name.includes('cinema') || name.includes('director') || name.includes('foley') || name.includes('set design') || name.includes('location scout') || name.includes('casting')) return '🎬';
    if (name.includes('music') || name.includes('audio') || name.includes('sound') || name.includes('dj') || name.includes('band') || name.includes('musician') || name.includes('sing') || name.includes('vocal') || name.includes('piano') || name.includes('voice') || name.includes('podcast')) return '🎧';

    // Beauty, Hair & Styling
    if (name.includes('hair') || name.includes('barber') || name.includes('stylist') || name.includes('color consultant')) return '💈';
    if (name.includes('makeup') || name.includes('cosmetics')) return '💄';
    if (name.includes('nail')) return '💅';
    if (name.includes('massage') || name.includes('spa') || name.includes('healer') || name.includes('reiki') || name.includes('wellness') || name.includes('sound bath')) return '💆';
    if (name.includes('esthet') || name.includes('lash') || name.includes('brow') || name.includes('wax') || name.includes('tan')) return '✨';

    // Fitness, Health & Medical
    if (name.includes('gym') || name.includes('trainer') || name.includes('fitness') || name.includes('yoga') || name.includes('pilates') || name.includes('athlete') || name.includes('sport') || name.includes('swim') || name.includes('climb') || name.includes('dive') || name.includes('skydive') || name.includes('paragliding') || name.includes('hang gliding') || name.includes('rafting') || name.includes('mountaineer') || name.includes('run')) return '🏋️';
    if (name.includes('diet') || name.includes('nutrition')) return '🍏';
    if (name.includes('health') || name.includes('care') || name.includes('medical') || name.includes('doctor') || name.includes('nurse') || name.includes('dentist') || name.includes('dental') || name.includes('optician') || name.includes('physio') || name.includes('chiropractor') || name.includes('acupunct') || name.includes('therapy') || name.includes('therapist') || name.includes('phleb') || name.includes('cardio') || name.includes('radio') || name.includes('ultra') || name.includes('mri') || name.includes('surgical') || name.includes('laboratory') || name.includes('pathology') || name.includes('pharmaco') || name.includes('clinical') || name.includes('doula') || name.includes('midwife') || name.includes('lactation') || name.includes('hospice')) return '🏥';

    // Event Planning, Food & Hospitality
    if (name.includes('food') || name.includes('cook') || name.includes('bake') || name.includes('cater') || name.includes('chef') || name.includes('sommelier') || name.includes('bartend') || name.includes('restaurant') || name.includes('wait') || name.includes('host') || name.includes('tour guide') || name.includes('travel') || name.includes('cruise')) return '🍳';
    if (name.includes('event planner') || name.includes('party') || name.includes('decorator') || name.includes('celebrant') || name.includes('wedding') || name.includes('officiant') || name.includes('magician') || name.includes('clown') || name.includes('face paint') || name.includes('balloon') || name.includes('caricature') || name.includes('festival') || name.includes('concert')) return '📅';
    if (name.includes('florist') || name.includes('flower')) return '💐';

    // Education, Coaching & Teaching
    if (name.includes('tutor') || name.includes('teach') || name.includes('educat') || name.includes('school') || name.includes('math') || name.includes('science') || name.includes('language') || name.includes('test prep') || name.includes('acting coach') || name.includes('public speaking') || name.includes('sewing instructor') || name.includes('librarian') || name.includes('researcher')) return '🎓';

    // Finance, Business, Legal & Admin
    if (name.includes('business') || name.includes('consult') || name.includes('finance') || name.includes('tax') || name.includes('bookkeeper') || name.includes('accountant') || name.includes('payroll') || name.includes('advisor') || name.includes('broker') || name.includes('bank') || name.includes('invest') || name.includes('crypto') || name.includes('forex') || name.includes('trader') || name.includes('fundrais') || name.includes('insurance') || name.includes('grant') || name.includes('merchandiser') || name.includes('e-commerce') || name.includes('dropshipper') || name.includes('shopify') || name.includes('amazon') || name.includes('sale') || name.includes('marketing') || name.includes('telemarket') || name.includes('lead gen') || name.includes('operations') || name.includes('logistics') || name.includes('supply chain') || name.includes('inventory') || name.includes('quality') || name.includes('iso auditor') || name.includes('compliance') || name.includes('risk') || name.includes('community manager') || name.includes('moderator') || name.includes('discord manager') || name.includes('twitch') || name.includes('influencer') || name.includes('ambassador') || name.includes('secret shopper') || name.includes('store detective') || name.includes('loss prevention')) return '💼';
    if (name.includes('notary') || name.includes('legal') || name.includes('lawyer') || name.includes('paralegal') || name.includes('mediat') || name.includes('private eye') || name.includes('investigator') || name.includes('process server') || name.includes('court reporter') || name.includes('bailiff') || name.includes('bounty hunter') || name.includes('polygraph') || name.includes('skip tracer') || name.includes('repossession') || name.includes('cop') || name.includes('police')) return '⚖️';

    // Pet & Animal Services
    if (name.includes('pet') || name.includes('dog') || name.includes('cat') || name.includes('groomer') || name.includes('vet') || name.includes('walker') || name.includes('sitter') || name.includes('trainer') || name.includes('aquarium') || name.includes('animal') || name.includes('equine') || name.includes('farrier') || name.includes('reptile') || name.includes('bird') || name.includes('boarding') || name.includes('falconry') || name.includes('horse') || name.includes('livestock')) return '🐕';

    // Security & Safety
    if (name.includes('security') || name.includes('guard') || name.includes('bodyguard') || name.includes('bouncer') || name.includes('fire safety') || name.includes('alarm') || name.includes('safety') || name.includes('ergo') || name.includes('hygienist') || name.includes('toxicologist') || name.includes('epidemiologist')) return '🛡️';

    // Specialized Crafts & Custom Trades
    if (name.includes('tailor') || name.includes('seamstress') || name.includes('sewing') || name.includes('custom') || name.includes('jewel') || name.includes('blacksmith') || name.includes('welder') || name.includes('potter') || name.includes('glassblow') || name.includes('woodworker') || name.includes('leather') || name.includes('cobbler') || name.includes('watch') || name.includes('clock') || name.includes('upholsterer') || name.includes('calligrapher') || name.includes('engraver') || name.includes('framer') || name.includes('knit') || name.includes('crochet') || name.includes('quilt') || name.includes('candle') || name.includes('soap') || name.includes('perfumer') || name.includes('machinist') || name.includes('cnc') || name.includes('millwright') || name.includes('industrial') || name.includes('operator')) return '🛠️';

    // Real Estate, Property & Environment
    if (name.includes('real estate') || name.includes('property') || name.includes('leasing') || name.includes('title agent') || name.includes('escrow officer') || name.includes('foreclosure') || name.includes('hoa') || name.includes('tenant') || name.includes('recycle') || name.includes('compost') || name.includes('sustainability') || name.includes('environment')) return '🏡';

    // Farming & Outdoors (Agricultural)
    if (name.includes('farm') || name.includes('tractor') || name.includes('crop') || name.includes('irrigation') || name.includes('beekeeper') || name.includes('shearer') || name.includes('orchard') || name.includes('dairy') || name.includes('park ranger') || name.includes('forest ranger') || name.includes('wildlife') || name.includes('biologist') || name.includes('botanist') || name.includes('zoologist')) return '🚜';
    
    return '📦'; // Default fallback emoji
};

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

export default function EcosystemPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [clickedCategoryId, setClickedCategoryId] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    // Filtered categories for the grid view
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        if (!debouncedSearchTerm.trim()) return categories;
        const q = debouncedSearchTerm.toLowerCase();
        return categories.filter((cat: any) => cat.name.toLowerCase().includes(q));
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
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6">
                             {filteredCategories.map((cat: any, i: number) => {
                                 const categoryEmoji = getCategoryEmoji(cat.name);
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
