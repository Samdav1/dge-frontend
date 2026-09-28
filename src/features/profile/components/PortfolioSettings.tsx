"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Briefcase, Upload, X, Loader2, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { getUserPortfolio, createUserPortfolio, updateUserPortfolio, uploadPortfolioMedia, deletePortfolioMedia } from "@/features/portfolio/actions";
import { UserPortfolio, PortfolioMedia } from "@/features/portfolio/types";
import { getBackendImageUrl } from "@/lib/imageUtils";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface UploadedFile {
    file?: File;
    preview: string;
    isExisting?: boolean;
    media?: PortfolioMedia;
}

function SuccessModal({
    open,
    onClose,
    title,
    message,
    nextLabel = "Continue to KYC Verification",
    onNext,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    nextLabel?: string;
    onNext?: () => void;
}) {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (!open || !onNext) return;
        setCountdown(3);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    onNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [open, onNext, onClose]);

    if (!open) return null;

    const handleNextClick = () => {
        onClose();
        if (onNext) onNext();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

                    {onNext && (
                        <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                            <span>Auto-advancing to next section in <strong>{countdown}s</strong>...</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {onNext && (
                            <button
                                onClick={handleNextClick}
                                className="w-full py-3.5 rounded-xl bg-[#C69C2E] text-white text-sm font-bold hover:bg-[#b08b29] transition-all shadow-lg shadow-[#C69C2E]/20 cursor-pointer flex items-center justify-center gap-2 group"
                            >
                                <span>{nextLabel}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer ${
                                !onNext ? "bg-[#C69C2E] text-white !py-3.5 !text-sm font-bold" : ""
                            }`}
                        >
                            {onNext ? "Stay on this section" : "Great!"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PortfolioSettingsProps {
    onNext?: () => void;
}

export function PortfolioSettings({ onNext }: PortfolioSettingsProps = {}) {
    const { data: session } = useSession();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Form state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [website, setWebsite] = useState("");
    const [facebook, setFacebook] = useState("");
    const [youtube, setYoutube] = useState("");
    const [twitter, setTwitter] = useState("");
    const [instagram, setInstagram] = useState("");

    // Media state
    const [photos, setPhotos] = useState<UploadedFile[]>([]);
    const [videos, setVideos] = useState<UploadedFile[]>([]);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);
    const [pendingVideoFiles, setPendingVideoFiles] = useState<File[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewItem, setPreviewItem] = useState<{ url: string; type: "image" | "video" } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        index: number;
        type: "photo" | "video";
        isExisting: boolean;
    } | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{
        [filename: string]: number;
    } | null>(null);

    // Load existing portfolio
    useEffect(() => {
        async function loadPortfolio() {
            try {
                const data = await getUserPortfolio();
                if (data) {
                    setPortfolio(data);
                    setTitle(data.title || "");
                    setDescription(data.description || "");
                    setCategory(data.category || "");
                    setWebsite(data.website || "");
                    setFacebook(data.facebook || "");
                    setYoutube(data.youtube || "");
                    setTwitter(data.twitter || "");
                    setInstagram(data.instagram || "");

                    // Load existing media
                    if (data.media && data.media.length > 0) {
                        const existingPhotos: UploadedFile[] = [];
                        const existingVideos: UploadedFile[] = [];

                        data.media.forEach((media) => {
                            const url = getBackendImageUrl(media.s3_key);
                            if (media.media_type.startsWith('image')) {
                                existingPhotos.push({ preview: url, isExisting: true, media });
                            } else if (media.media_type.startsWith('video')) {
                                existingVideos.push({ preview: url, isExisting: true, media });
                            }
                        });

                        setPhotos(existingPhotos);
                        setVideos(existingVideos);
                    }
                }
            } catch (error) {
                console.error("Failed to load portfolio:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadPortfolio();
    }, []);

    const handlePhotoUploadClick = () => {
        if (photos.length < 3 && photoInputRef.current) {
            photoInputRef.current.click();
        }
    };

    const handleVideoUploadClick = () => {
        if (videos.length < 3 && videoInputRef.current) {
            videoInputRef.current.click();
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (photos.length >= 3) {
            setError("You can only upload up to 3 photos");
            return;
        }

        const preview = URL.createObjectURL(file);
        setPhotos((prev) => [...prev, { file, preview }]);
        setPendingPhotoFiles((prev) => [...prev, file]);

        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (videos.length >= 3) {
            setError("You can only upload up to 3 videos");
            return;
        }

        const preview = URL.createObjectURL(file);
        setVideos((prev) => [...prev, { file, preview }]);
        setPendingVideoFiles((prev) => [...prev, file]);

        if (videoInputRef.current) {
            videoInputRef.current.value = "";
        }
    };

    const removePhoto = async (index: number) => {
        const photo = photos[index];
        if (photo.isExisting && photo.media) {
            try {
                await deletePortfolioMedia(photo.media.id);
            } catch (error) {
                console.error("Failed to delete photo:", error);
                setError("Failed to delete photo from server");
                return;
            }
        }

        setPhotos((prev) => {
            const newPhotos = [...prev];
            const removed = newPhotos[index];
            if (!removed.isExisting && removed.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            if (removed.file) {
                setPendingPhotoFiles((files) => files.filter((f) => f !== removed.file));
            }
            newPhotos.splice(index, 1);
            return newPhotos;
        });
    };

    const removeVideo = async (index: number) => {
        const video = videos[index];
        if (video.isExisting && video.media) {
            try {
                await deletePortfolioMedia(video.media.id);
            } catch (error) {
                console.error("Failed to delete video:", error);
                setError("Failed to delete video from server");
                return;
            }
        }

        setVideos((prev) => {
            const newVideos = [...prev];
            const removed = newVideos[index];
            if (!removed.isExisting && removed.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            if (removed.file) {
                setPendingVideoFiles((files) => files.filter((f) => f !== removed.file));
            }
            newVideos.splice(index, 1);
            return newVideos;
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        const { index, type } = deleteConfirm;
        if (type === "photo") {
            await removePhoto(index);
        } else {
            await removeVideo(index);
        }
        setDeleteConfirm(null);
    };

    const handleSubmit = async () => {
        setError(null);
        if (!title.trim()) {
            setError("Profession is required");
            return;
        }

        setIsSaving(true);

        try {
            let savedPortfolio: UserPortfolio;

            const portfolioData = {
                title,
                description: description || undefined,
                category: category || undefined,
                website: website || undefined,
                facebook: facebook || undefined,
                youtube: youtube || undefined,
                twitter: twitter || undefined,
                instagram: instagram || undefined,
            };

            if (portfolio) {
                savedPortfolio = await updateUserPortfolio(portfolioData);
            } else {
                savedPortfolio = await createUserPortfolio(portfolioData);
            }

            setPortfolio(savedPortfolio);

            // Upload all pending files concurrently
            const allPendingFiles = [...pendingPhotoFiles, ...pendingVideoFiles];

            if (allPendingFiles.length > 0) {
                setIsUploadingPhoto(pendingPhotoFiles.length > 0);
                setIsUploadingVideo(pendingVideoFiles.length > 0);

                const token = session?.backendToken || "";

                // Initialize progress tracking state
                const initialProgress: { [key: string]: number } = {};
                allPendingFiles.forEach((file) => {
                    initialProgress[file.name] = 0;
                });
                setUploadProgress(initialProgress);

                const uploadResults = await Promise.allSettled(
                    allPendingFiles.map((file) => {
                        return new Promise((resolve, reject) => {
                            const xhr = new XMLHttpRequest();
                            const formData = new FormData();
                            formData.append("file", file);

                            xhr.open("POST", `/api/portfolio/upload?portfolio_id=${savedPortfolio.id}`);
                            xhr.setRequestHeader("Authorization", `Bearer ${token}`);

                            // Track progress
                            xhr.upload.onprogress = (event) => {
                                if (event.lengthComputable) {
                                    const percent = Math.round((event.loaded / event.total) * 100);
                                    setUploadProgress((prev) => prev ? {
                                        ...prev,
                                        [file.name]: percent
                                    } : null);
                                }
                            };

                            xhr.onload = () => {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    try {
                                        const resData = JSON.parse(xhr.responseText);
                                        resolve(resData);
                                    } catch (e) {
                                        resolve({});
                                    }
                                } else {
                                    reject(new Error(xhr.statusText || "Upload failed"));
                                }
                            };

                            xhr.onerror = () => {
                                reject(new Error("Network error during upload"));
                            };

                            xhr.send(formData);
                        });
                    })
                );

                setUploadProgress(null);

                // Report any individual failures
                const failures = uploadResults.filter((r) => r.status === "rejected");
                if (failures.length > 0) {
                    console.error(`${failures.length} file(s) failed to upload:`, failures);
                    setError(`${failures.length} file(s) failed to upload. The rest were saved successfully.`);
                }

                setPendingPhotoFiles([]);
                setPendingVideoFiles([]);
                setIsUploadingPhoto(false);
                setIsUploadingVideo(false);
            }

            // Always fetch fresh portfolio to reconcile state (Pending → Existing)
            const freshPortfolio = await getUserPortfolio();
            if (freshPortfolio) {
                setPortfolio(freshPortfolio);
                const existingPhotos: UploadedFile[] = [];
                const existingVideos: UploadedFile[] = [];

                (freshPortfolio.media || []).forEach((media) => {
                    const url = getBackendImageUrl(media.s3_key);
                    if (media.media_type.startsWith('image')) {
                        existingPhotos.push({ preview: url, isExisting: true, media });
                    } else if (media.media_type.startsWith('video')) {
                        existingVideos.push({ preview: url, isExisting: true, media });
                    }
                });

                setPhotos(existingPhotos);
                setVideos(existingVideos);
            }

            setShowSuccess(true);
            router.refresh();
        } catch (error) {
            console.error("Failed to save portfolio:", error);
            setError("Failed to save portfolio. Please try again.");
        } finally {
            setIsSaving(false);
            setIsUploadingPhoto(false);
            setIsUploadingVideo(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#C69C2E] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hidden File Inputs */}
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
            />
            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
            />

            {/* Portfolio Icon */}
            <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#C69C2E] flex items-center justify-center mb-4 shadow-lg shadow-[#C69C2E]/20">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Portfolio</h2>
                <p className="text-xs text-gray-500">Update your portfolio and setup your portfolio.</p>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Profession <span className="text-red-500">*</span></label>
                    <Input
                        placeholder="Enter Profession"
                        className="h-12 bg-white border-gray-200 rounded-xl"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Description</label>
                    <Textarea
                        placeholder="Enter Description"
                        className="min-h-[120px] bg-white border-gray-200 rounded-xl resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Recent Work Picture</label>
                    <p className="text-xs text-gray-500 mb-2">You can only upload three photos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Display uploaded photos */}
                        {photos.map((photo, index) => (
                            <div 
                                key={index} 
                                className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
                                onClick={() => setPreviewItem({ url: photo.preview, type: "image" })}
                            >
                                {/* Standard img avoids next/image sizing constraints during rapid uploads */}
                                <img
                                    src={photo.preview}
                                    alt={`Uploaded photo ${index + 1}`}
                                    className="object-contain w-full h-full"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm({ index, type: "photo", isExisting: !!photo.isExisting });
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded font-medium ${
                                    photo.isExisting ? "bg-emerald-600/80" : "bg-amber-500/80"
                                }`}>
                                    {photo.isExisting ? "Saved" : "Ready to Save"}
                                </div>
                            </div>
                        ))}
                        {/* Upload button - only show if less than 3 photos */}
                        {photos.length < 3 && (
                            <button
                                type="button"
                                onClick={handlePhotoUploadClick}
                                disabled={isUploadingPhoto}
                                className="aspect-square border-2 border-dashed border-[#C69C2E]/40 rounded-xl flex flex-col items-center justify-center bg-[#C69C2E]/5 cursor-pointer hover:bg-[#C69C2E]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploadingPhoto ? (
                                    <Loader2 className="w-6 h-6 text-[#C69C2E] animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-[#C69C2E] mb-2" />
                                        <span className="text-xs text-gray-500">Upload Photo</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Recent Work Video</label>
                    <p className="text-xs text-gray-500 mb-2">You can only upload three videos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Display uploaded videos */}
                        {videos.map((video, index) => (
                            <div 
                                key={index} 
                                className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
                                onClick={() => setPreviewItem({ url: video.preview, type: "video" })}
                            >
                                <video
                                    src={`${video.preview}#t=0.1`}
                                    preload="metadata"
                                    playsInline
                                    className="object-contain w-full h-full"
                                    muted
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm({ index, type: "video", isExisting: !!video.isExisting });
                                    }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded font-medium ${
                                    video.isExisting ? "bg-emerald-600/80" : "bg-amber-500/80"
                                }`}>
                                    {video.isExisting ? "Saved" : "Ready to Save"}
                                </div>
                            </div>
                        ))}
                        {/* Upload button - only show if less than 3 videos */}
                        {videos.length < 3 && (
                            <button
                                type="button"
                                onClick={handleVideoUploadClick}
                                disabled={isUploadingVideo}
                                className="aspect-square border-2 border-dashed border-[#C69C2E]/40 rounded-xl flex flex-col items-center justify-center bg-[#C69C2E]/5 cursor-pointer hover:bg-[#C69C2E]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploadingVideo ? (
                                    <Loader2 className="w-6 h-6 text-[#C69C2E] animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-[#C69C2E] mb-2" />
                                        <span className="text-xs text-gray-500 text-center px-2">Upload Video</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="writing">Writing</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Social Profiles Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">Social Profiles</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Website</label>
                        <Input
                            placeholder="https://yourwebsite.com"
                            className="h-12 bg-white border-gray-200 rounded-xl"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Facebook</label>
                            <Input
                                placeholder="Facebook Profile URL"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">YouTube</label>
                            <Input
                                placeholder="YouTube Channel URL"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">X (Twitter)</label>
                            <Input
                                placeholder="X (Twitter) Profile URL"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Instagram</label>
                            <Input
                                placeholder="Instagram Profile URL"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full h-12 bg-[#C69C2E] hover:bg-[#b08b29] text-white font-bold rounded-xl mt-4"
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        portfolio ? "Update Portfolio" : "Create Portfolio"
                    )}
                </Button>
            </div>

            <SuccessModal
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Portfolio Updated!"
                message="Your professional portfolio has been saved and is now visible to clients."
                nextLabel="Continue to KYC Verification"
                onNext={onNext}
            />

            {previewItem && (
                <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
                    <DialogContent className="max-w-5xl w-auto max-h-[90vh] p-2 sm:p-4 overflow-hidden border-none bg-black/95 backdrop-blur-md rounded-2xl flex items-center justify-center relative shadow-2xl">
                        <DialogTitle className="sr-only">Media Preview</DialogTitle>
                        <button
                            type="button"
                            onClick={() => setPreviewItem(null)}
                            className="absolute top-4 right-4 z-[100] p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        {previewItem.type === "image" ? (
                            <img
                                src={previewItem.url}
                                alt="Preview"
                                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={previewItem.url}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {deleteConfirm && (
                <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                    <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Delete Media</DialogTitle>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete this {deleteConfirm.type}? 
                            {deleteConfirm.isExisting && " This action will permanently remove the file from the server and cannot be undone."}
                        </p>
                        <div className="flex gap-4 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmDelete}
                                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {uploadProgress && (
                <Dialog open={!!uploadProgress}>
                    <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col">
                        <DialogTitle className="text-xl font-bold text-gray-900 mb-4 text-center">Uploading Media</DialogTitle>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                            Please wait while your media files are being uploaded to the server...
                        </p>
                        <div className="space-y-4 w-full max-h-[40vh] overflow-y-auto pr-1">
                            {Object.entries(uploadProgress).map(([filename, progress]) => {
                                return (
                                    <div key={filename} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                                            <span className="truncate max-w-[250px]">{filename}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-[#C69C2E] h-full rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
