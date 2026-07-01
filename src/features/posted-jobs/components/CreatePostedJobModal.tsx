"use client";

import React, { useState } from "react";
import {
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    DollarSign,
    FileText,
    Tag,
    Image as ImageIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/features/marketplace/hooks/useMarketplace";
import { createPostedJob, uploadJobImage } from "@/features/posted-jobs/actions";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { CategorySearchPicker } from "@/components/ui/CategorySearchPicker";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function CreatePostedJobModal({ open, onClose }: Props) {
    const qc = useQueryClient();
    const { data: categories } = useCategories();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!open) return null;

    const resetForm = () => {
        setTitle(""); setDescription(""); setCategoryId("");
        setMinPrice(""); setMaxPrice(""); setImageUrl("");
        setImageFile(null);
        setError(null); setSuccess(false);
    };

    const handleClose = () => { resetForm(); onClose(); };

    const handleSubmit = async () => {
        if (!title.trim()) { setError("Title is required."); return; }
        if (!description.trim()) { setError("Description is required."); return; }
        if (!categoryId) { setError("Please select a category."); return; }
        const minCents = Math.round(parseFloat(minPrice) * 100);
        const maxCents = Math.round(parseFloat(maxPrice) * 100);
        if (isNaN(minCents) || minCents <= 0) { setError("Please enter a valid minimum price."); return; }
        if (isNaN(maxCents) || maxCents <= 0) { setError("Please enter a valid maximum price."); return; }
        if (maxCents < minCents) { setError("Maximum price must be greater than minimum price."); return; }

        setIsSubmitting(true);
        setError(null);

        let finalImageUrl = imageUrl;
        if (imageFile) {
            const formData = new FormData();
            formData.append("file", imageFile);
            const uploadResult = await uploadJobImage(formData);
            if (uploadResult.success && uploadResult.url) {
                finalImageUrl = uploadResult.url;
            } else {
                setError(uploadResult.error || "Failed to upload image.");
                setIsSubmitting(false);
                return;
            }
        }

        const result = await createPostedJob({
            title: title.trim(),
            description: description.trim(),
            category_id: categoryId,
            min_price_cents: minCents,
            max_price_cents: maxCents,
            image: finalImageUrl.trim() || undefined,
        });

        setIsSubmitting(false);

        if (!result.success) {
            setError(result.error ?? "Failed to create job.");
            return;
        }

        setSuccess(true);
        qc.invalidateQueries({ queryKey: ["posted_jobs"] });
        setTimeout(handleClose, 1800);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={handleClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl my-auto animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d44] p-6 text-white rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-xl">Post a Job</h2>
                            <p className="text-white/60 text-sm mt-0.5">Request help from service providers</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {success ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="font-bold text-gray-900 text-lg">Job Posted!</p>
                            <p className="text-sm text-gray-500 text-center">
                                Your job is now live and providers can start bidding.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="inline w-3.5 h-3.5 mr-1" />
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Need a Logo Designer for my startup"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe your requirements in detail. What do you need done? What are your expectations?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50 resize-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Tag className="inline w-3.5 h-3.5 mr-1" />
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <CategorySearchPicker
                                    categories={(categories || []).map((cat: any) => ({ id: cat.id.toString ? cat.id.toString() : cat.id, name: cat.name }))}
                                    value={categoryId}
                                    onChange={(val) => setCategoryId(val)}
                                    placeholder="Select category"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <span className="inline-block mr-1 font-bold text-gray-700">₦</span>
                                    Budget Range (NGN) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₦</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50"
                                        />
                                    </div>
                                    <div className="flex items-center text-gray-400 font-medium">–</div>
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₦</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C69C2E]/30 bg-gray-50"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
                                    ⚠️ Your wallet must have at least ₦{maxPrice || "Max"} balance to post a job.
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <ImageIcon className="inline w-3.5 h-3.5 mr-1" />
                                    Cover Image <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="space-y-3">
                                    {imageFile || imageUrl ? (
                                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-100 group">
                                            <img
                                                src={imageFile ? URL.createObjectURL(imageFile) : getBackendImageUrl(imageUrl)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => { setImageFile(null); setImageUrl(""); }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#C69C2E] hover:bg-gray-50 cursor-pointer transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-[#C69C2E] mb-2" />
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WebP (max. 2MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setImageFile(file);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {typeof error === 'string' ? error : JSON.stringify(error)}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Posting Job...</>
                                ) : (
                                    "Post Job"
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
