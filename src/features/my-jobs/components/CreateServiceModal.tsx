"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateService, useUpdateService } from "../hooks/useMyJobs";
import { useCategories } from "@/features/marketplace/hooks/useMarketplace";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { CategorySearchPicker } from "@/components/ui/CategorySearchPicker";

interface CreateServiceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "create" | "edit";
    serviceToEdit?: any;
    onSuccess?: () => void;
}

export function CreateServiceModal({ open, onOpenChange, mode = "create", serviceToEdit, onSuccess }: CreateServiceModalProps) {
    const [hasDiscount, setHasDiscount] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSuccessState, setIsSuccessState] = useState(false);

    const createServiceMutation = useCreateService();
    const updateServiceMutation = useUpdateService();
    const { data: categories } = useCategories();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount_percent: "",
        service_type: "",
        category_ids: "",
        meta_tags: "",
        keywords: "",
    });

    useEffect(() => {
        if (!open) {
            setIsSuccessState(false);
        }
        if (mode === "edit" && serviceToEdit) {
            setFormData({
                name: serviceToEdit.name || "",
                description: serviceToEdit.description || "",
                price: serviceToEdit.price?.toString() || "",
                discount_percent: serviceToEdit.discount_percent?.toString() || "",
                service_type: serviceToEdit.type || "",
                category_ids: serviceToEdit.categories?.[0]?.id || "",
                meta_tags: serviceToEdit.meta_tags || "",
                keywords: serviceToEdit.keywords || "",
            });
            setHasDiscount(serviceToEdit.discount || false);
            setImagePreview(serviceToEdit.image ? getBackendImageUrl(serviceToEdit.image) : null);
        } else {
            // Reset form for create mode
            setFormData({
                name: "",
                description: "",
                price: "",
                discount_percent: "",
                service_type: "",
                category_ids: "",
                meta_tags: "",
                keywords: "",
            });
            setHasDiscount(false);
            setImage(null);
            setImagePreview(null);
        }
    }, [mode, serviceToEdit, open]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const submitFormData = new FormData();
            submitFormData.append("name", formData.name);
            submitFormData.append("description", formData.description);
            submitFormData.append("price", formData.price);
            submitFormData.append("discount", hasDiscount.toString());

            if (hasDiscount && formData.discount_percent) {
                submitFormData.append("discount_percent", formData.discount_percent);
            }

            submitFormData.append("service_type", formData.service_type);

            if (formData.category_ids) {
                submitFormData.append("category_ids", JSON.stringify([formData.category_ids]));
            }
            if (formData.meta_tags) {
                submitFormData.append("meta_tags", formData.meta_tags);
            }
            if (formData.keywords) {
                submitFormData.append("keywords", formData.keywords);
            }

            if (image) {
                submitFormData.append("image", image);
            }

            if (mode === "edit" && serviceToEdit) {
                await updateServiceMutation.mutateAsync({ id: serviceToEdit.id, formData: submitFormData });
                onOpenChange(false);
                onSuccess?.();
            } else {
                await createServiceMutation.mutateAsync(submitFormData);
                setIsSuccessState(true);
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError((err as Error).message || "An unexpected error occurred");
        }
    };

    const title = mode === "create" ? "Create Services" : "Edit Service";
    const buttonText = mode === "create" ? "Create Service" : "Save Changes";
    const isSubmitting = createServiceMutation.isPending || updateServiceMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${isSuccessState ? "sm:max-w-[500px]" : "sm:max-w-[600px]"} max-h-[90vh] overflow-y-auto`}>
                {isSuccessState ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                            Service Created Successfully!
                        </h2>

                        <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-100 space-y-3">
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2 gap-4">
                                <span className="text-gray-500 font-medium shrink-0">Service Name</span>
                                <span className="text-gray-900 font-semibold truncate text-right">{formData.name}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-medium">Price</span>
                                <span className="text-gray-900 font-semibold">₦{parseFloat(formData.price || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                                <span className="text-gray-500 font-medium">Type</span>
                                <span className="text-gray-900 font-semibold capitalize">{formData.service_type}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                    Pending Approval
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
                            Your service listing has been submitted and is currently <span className="text-amber-600 font-semibold">pending administrator approval</span>. It will be live on the marketplace as soon as it is approved.
                        </p>

                        <Button
                            onClick={() => {
                                onOpenChange(false);
                                onSuccess?.();
                            }}
                            className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-medium text-base"
                        >
                            Got it, thank you!
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {title}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 py-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="name">Service Name *</Label>
                                    <span className={`text-xs ${formData.name.length < 10 || formData.name.length > 100 ? "text-red-500" : "text-gray-500"}`}>
                                        {formData.name.length}/100 (min 10)
                                    </span>
                                </div>
                                <Input
                                    id="name"
                                    placeholder="Enter service name"
                                    className="bg-gray-50 border-gray-200"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    minLength={10}
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="description">Description *</Label>
                                    <span className={`text-xs ${formData.description.length < 50 || formData.description.length > 1000 ? "text-red-500" : "text-gray-500"}`}>
                                        {formData.description.length}/1000 (min 50)
                                    </span>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Enter description"
                                    className="bg-gray-50 border-gray-200 min-h-[100px]"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    minLength={50}
                                    maxLength={1000}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter Price"
                                    className="bg-gray-50 border-gray-200"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Do you want to create a discount for this service?</Label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${hasDiscount ? "border-[#C69C2E]" : "border-gray-300"}`}>
                                            {hasDiscount && <div className="w-3 h-3 rounded-full bg-[#C69C2E]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="discount"
                                            className="hidden"
                                            checked={hasDiscount}
                                            onChange={() => setHasDiscount(true)}
                                        />
                                        <span className="text-sm text-gray-700">Yes</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!hasDiscount ? "border-[#C69C2E]" : "border-gray-300"}`}>
                                            {!hasDiscount && <div className="w-3 h-3 rounded-full bg-[#C69C2E]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="discount"
                                            className="hidden"
                                            checked={!hasDiscount}
                                            onChange={() => setHasDiscount(false)}
                                        />
                                        <span className="text-sm text-gray-700">No</span>
                                    </label>
                                </div>
                            </div>

                            {hasDiscount && (
                                <div className="space-y-2">
                                    <Label htmlFor="discount_percent">Discount Percentage</Label>
                                    <Input
                                        id="discount_percent"
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter discount percentage"
                                        className="bg-gray-50 border-gray-200"
                                        value={formData.discount_percent}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Service Type *</Label>
                                <Select
                                    value={formData.service_type}
                                    onValueChange={(value) => handleSelectChange("service_type", value)}
                                >
                                    <SelectTrigger className="bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="physical">Physical</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <CategorySearchPicker
                                    categories={(categories || []).map((cat: any) => ({ id: cat.id.toString(), name: cat.name }))}
                                    value={formData.category_ids}
                                    onChange={(value) => handleSelectChange("category_ids", value)}
                                    placeholder="Select category"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                                <Input
                                    id="keywords"
                                    placeholder="e.g. design, logo, branding"
                                    className="bg-gray-50 border-gray-200"
                                    value={formData.keywords}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Service Image</Label>
                                <div className="relative">
                                    {imagePreview ? (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-100 group mb-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setImage(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-[#C69C2E] rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                            />
                                            <div className="w-10 h-10 bg-[#C69C2E]/10 rounded-full flex items-center justify-center mb-3">
                                                <Upload className="w-5 h-5 text-[#C69C2E]" />
                                            </div>
                                            <p className="text-sm text-gray-500">Upload image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#C69C2E] hover:bg-[#b08b29] text-white h-12 rounded-xl font-medium text-base mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (mode === "create" ? "Creating..." : "Saving...") : buttonText}
                            </Button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
