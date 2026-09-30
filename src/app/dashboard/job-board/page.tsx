"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Loader2, Briefcase, Plus, MapPin, Navigation, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useOpenPostedJobs } from "@/features/posted-jobs/hooks/usePostedJobs";
import { useCategories } from "@/features/marketplace/hooks/useMarketplace";
import { useDebounce } from "@/hooks/useDebounce";
import { JobBoardCard } from "@/features/posted-jobs/components/JobBoardCard";
import { JobBoardSectionSkeleton } from "@/features/posted-jobs/components/JobBoardCardSkeleton";
import { PostedJobDetailsModal } from "@/features/posted-jobs/components/PostedJobDetailsModal";
import { CreatePostedJobModal } from "@/features/posted-jobs/components/CreatePostedJobModal";
import { PostedJob } from "@/features/posted-jobs/actions";
import { useKycGate } from "@/hooks/useKycGate";
import {
    COUNTRIES,
    getStatesForCountry,
    getCitiesForState,
    parseJobLocation,
} from "@/lib/countries-states";
import { getProfile } from "@/features/profile/actions";

export default function JobBoardPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedCountry, setSelectedCountry] = useState<string>("Nigeria");
    const [selectedState, setSelectedState] = useState<string>("all");
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [isNearMe, setIsNearMe] = useState(false);
    const [userLocation, setUserLocation] = useState<{ country?: string; state?: string; city?: string } | null>(null);

    const [selectedJob, setSelectedJob] = useState<PostedJob | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { checkKyc, KycGateModal } = useKycGate();

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch user profile location on mount for "Near Me" feeding
    useEffect(() => {
        let isSubscribed = true;
        getProfile().then((res) => {
            if (isSubscribed && res?.success && res.data) {
                setUserLocation({
                    country: res.data.country || "Nigeria",
                    state: res.data.state || "",
                    city: res.data.city || "",
                });
            }
        }).catch(() => {});
        return () => { isSubscribed = false; };
    }, []);

    // Preloaded states and cities
    const availableStates = useMemo(() => {
        return getStatesForCountry(selectedCountry === "all" ? "Nigeria" : selectedCountry);
    }, [selectedCountry]);

    const availableCities = useMemo(() => {
        if (selectedState === "all") return [];
        return getCitiesForState(selectedState);
    }, [selectedState]);

    const { data: jobs, isLoading, error } = useOpenPostedJobs({
        search: debouncedSearchTerm,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
    });

    const { data: categories } = useCategories();

    // Toggle Near Me
    const handleToggleNearMe = () => {
        if (isNearMe) {
            setIsNearMe(false);
            setSelectedState("all");
            setSelectedCity("all");
        } else {
            setIsNearMe(true);
            if (userLocation?.state) {
                setSelectedCountry(userLocation.country || "Nigeria");
                setSelectedState(userLocation.state);
                setSelectedCity(userLocation.city || "all");
            } else {
                // If user has not set state in profile, default to Lagos
                setSelectedCountry("Nigeria");
                setSelectedState("Lagos");
                setSelectedCity("all");
            }
        }
    };

    // Filter jobs client-side by location for instant zero-lag response
    const filteredJobs = useMemo(() => {
        if (!jobs) return [];
        return jobs.filter((job) => {
            const loc = parseJobLocation(job.description, job.title);

            // Filter by country
            if (selectedCountry !== "all" && loc.country) {
                if (loc.country.toLowerCase() !== selectedCountry.toLowerCase()) {
                    return false;
                }
            }

            // Filter by state
            if (selectedState !== "all") {
                if (!loc.state || loc.state.toLowerCase() !== selectedState.toLowerCase()) {
                    return false;
                }
            }

            // Filter by city
            if (selectedCity !== "all") {
                if (!loc.city || !loc.city.toLowerCase().includes(selectedCity.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
    }, [jobs, selectedCountry, selectedState, selectedCity]);

    const hasActiveLocationFilter = selectedState !== "all" || selectedCity !== "all" || isNearMe;

    const clearLocationFilters = () => {
        setIsNearMe(false);
        setSelectedCountry("Nigeria");
        setSelectedState("all");
        setSelectedCity("all");
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Board</h1>
                    <p className="text-gray-500 mt-1">Browse and find service requests filtered by your local neighborhood or city</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                        className="flex items-center gap-2 bg-[#C69C2E] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#C69C2E]/20 hover:bg-[#b08b29] hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Post a Job
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-[#C69C2E] font-medium">Job Board</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                {/* Search & Category */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search jobs by title, skill, or keyword..."
                            className="pl-12 h-14 bg-gray-50 border-none rounded-2xl w-full text-base focus-visible:ring-2 focus-visible:ring-[#C69C2E]/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full lg:w-64 h-14 rounded-2xl bg-white border-gray-100 shadow-sm font-medium">
                                <div className="flex items-center gap-3">
                                    <SlidersHorizontal className="w-4 h-4 text-[#C69C2E]" />
                                    <SelectValue placeholder="All Categories" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-80">
                                <SelectItem value="all" className="py-3">All Categories</SelectItem>
                                {categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id} className="py-3">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Location Filters Bar (Country, State, City, Near Me) */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#C69C2E]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Filter by Location</span>
                        </div>

                        {/* Near Me Quick Button */}
                        <button
                            onClick={handleToggleNearMe}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                isNearMe
                                    ? "bg-[#C69C2E] text-white shadow-md shadow-[#C69C2E]/25"
                                    : "bg-gray-100 text-gray-700 hover:bg-[#C69C2E]/10 hover:text-[#C69C2E]"
                            }`}
                        >
                            <Navigation className={`w-3.5 h-3.5 ${isNearMe ? "animate-pulse" : ""}`} />
                            <span>
                                {isNearMe
                                    ? `Showing Near You (${userLocation?.state || "Lagos"})`
                                    : "Jobs Near Me"}
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Country Selector */}
                        <div>
                            <Select
                                value={selectedCountry}
                                onValueChange={(val) => {
                                    setSelectedCountry(val);
                                    setSelectedState("all");
                                    setSelectedCity("all");
                                    setIsNearMe(false);
                                }}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-medium">
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-72">
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {COUNTRIES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* State Selector */}
                        <div>
                            <Select
                                value={selectedState}
                                onValueChange={(val) => {
                                    setSelectedState(val);
                                    setSelectedCity("all");
                                    setIsNearMe(false);
                                }}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-medium">
                                    <SelectValue placeholder="All States / Regions" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-72">
                                    <SelectItem value="all">All States</SelectItem>
                                    {availableStates.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City Selector */}
                        <div>
                            <Select
                                value={selectedCity}
                                onValueChange={(val) => {
                                    setSelectedCity(val);
                                    setIsNearMe(false);
                                }}
                                disabled={selectedState === "all" || availableCities.length === 0}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-medium disabled:opacity-50">
                                    <SelectValue placeholder={selectedState === "all" ? "Select state first" : "All Cities / Areas"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-72">
                                    <SelectItem value="all">All Cities / Areas</SelectItem>
                                    {availableCities.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filter Pill & Quick Location Presets */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-50 text-xs">
                        <span className="text-gray-400 font-medium">Popular:</span>
                        {[
                            { label: "Lagos", state: "Lagos" },
                            { label: "Abuja", state: "FCT" },
                            { label: "Port Harcourt", state: "Rivers" },
                            { label: "Ibadan", state: "Oyo" },
                            { label: "Kano", state: "Kano" },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    setSelectedCountry("Nigeria");
                                    setSelectedState(preset.state);
                                    setSelectedCity("all");
                                    setIsNearMe(false);
                                }}
                                className={`px-2.5 py-1 rounded-lg border transition-all ${
                                    selectedState === preset.state && !isNearMe
                                        ? "bg-[#C69C2E]/10 border-[#C69C2E] text-[#C69C2E] font-bold"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}

                        {hasActiveLocationFilter && (
                            <button
                                onClick={clearLocationFilters}
                                className="ml-auto text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold hover:underline"
                            >
                                <X className="w-3.5 h-3.5" />
                                Reset Location
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <JobBoardSectionSkeleton count={6} />
            ) : error ? (
                <div className="flex flex-col justify-center items-center h-96 bg-red-50 rounded-3xl border border-red-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <SlidersHorizontal className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
                    <p className="text-red-600 max-w-md">
                        {(error as Error).message || "Failed to fetch jobs. Please check your connection and try again."}
                    </p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-96 bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found in this location</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                        {hasActiveLocationFilter
                            ? `We couldn't find any open jobs matching ${selectedCity !== "all" ? selectedCity + ", " : ""}${selectedState !== "all" ? selectedState : "your location"}. Try browsing other states or resetting your filters.`
                            : searchTerm || selectedCategory !== "all" 
                            ? "We couldn't find any jobs matching your current filters. Try adjusting your search." 
                            : "There are currently no open jobs. Be the first to post a job and find the perfect service provider!"}
                    </p>
                    <div className="flex items-center gap-3">
                        {hasActiveLocationFilter && (
                            <button
                                onClick={clearLocationFilters}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                            >
                                View All Locations
                            </button>
                        )}
                        <button
                            onClick={() => checkKyc(() => setIsCreateOpen(true), "post jobs")}
                            className="bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Post a job here
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {hasActiveLocationFilter && (
                        <div className="flex items-center justify-between bg-[#C69C2E]/5 border border-[#C69C2E]/20 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-gray-700">
                            <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#C69C2E]" />
                                Showing <strong>{filteredJobs.length}</strong> {filteredJobs.length === 1 ? "job" : "jobs"} in{" "}
                                <span className="font-bold text-gray-900">
                                    {selectedCity !== "all" ? `${selectedCity}, ` : ""}
                                    {selectedState !== "all" ? selectedState : selectedCountry}
                                </span>
                            </span>
                            <button
                                onClick={clearLocationFilters}
                                className="text-[#C69C2E] font-bold hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredJobs.map((job: PostedJob) => (
                            <JobBoardCard
                                key={job.id}
                                job={job}
                                onClick={() => setSelectedJob(job)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedJob && (
                <PostedJobDetailsModal
                    job={selectedJob}
                    open={!!selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}

            <CreatePostedJobModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
            {KycGateModal}
        </div>
    );
}
