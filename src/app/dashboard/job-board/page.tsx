"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Loader2, Briefcase, Plus } from "lucide-react";
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

export default function JobBoardPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedJob, setSelectedJob] = useState<PostedJob | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data: jobs, isLoading, error } = useOpenPostedJobs({
        search: debouncedSearchTerm,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
    });

    const { data: categories } = useCategories();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Board</h1>
                    <p className="text-gray-500 mt-1">Browse requests for services from clients across the platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateOpen(true)}
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
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search jobs by title, description or keyword..."
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
                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
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
            ) : !jobs || jobs.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-96 bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                        {searchTerm || selectedCategory !== "all" 
                            ? "We couldn't find any jobs matching your current filters. Try adjusting your search." 
                            : "There are currently no open jobs. Be the first to post a job and find the perfect service provider!"}
                    </p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="text-[#C69C2E] font-bold hover:underline underline-offset-4 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Post a job now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {jobs.map((job: PostedJob) => (
                        <JobBoardCard
                            key={job.id}
                            job={job}
                            onClick={() => setSelectedJob(job)}
                        />
                    ))}
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
        </div>
    );
}
