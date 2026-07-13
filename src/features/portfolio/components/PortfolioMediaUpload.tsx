"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { PortfolioMedia } from "../types";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getBackendImageUrl } from "@/lib/imageUtils";

interface PortfolioMediaUploadProps {
    portfolioId: string;
    initialMedia?: PortfolioMedia[];
    onUploadComplete?: (media: PortfolioMedia) => void;
}


export function PortfolioMediaUpload({ portfolioId, initialMedia = [], onUploadComplete }: PortfolioMediaUploadProps) {
    const { data: session } = useSession();
    const [isUploading, setIsUploading] = useState(false);
    const [mediaList, setMediaList] = useState<PortfolioMedia[]>(initialMedia);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewItem, setPreviewItem] = useState<{ url: string; type: "image" | "video" } | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const token = session?.backendToken || "";
            
            const newMedia = await new Promise<PortfolioMedia>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append("file", file);

                xhr.open("POST", `/api/portfolio/upload?portfolio_id=${portfolioId}`);
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);

                setUploadProgress(0);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                    }
                };

                xhr.onload = () => {
                    setUploadProgress(null);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const resData = JSON.parse(xhr.responseText);
                            resolve(resData);
                        } catch (e) {
                            reject(new Error("Invalid server response"));
                        }
                    } else {
                        reject(new Error(xhr.statusText || "Upload failed"));
                    }
                };

                xhr.onerror = () => {
                    setUploadProgress(null);
                    reject(new Error("Network error"));
                };

                xhr.send(formData);
            });

            setMediaList((prev) => [...prev, newMedia]);
            if (onUploadComplete) {
                onUploadComplete(newMedia);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload media. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleUploadClick = () => {
        if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Portfolio Media</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map((media) => {
                    const mediaSrc = getBackendImageUrl(media.s3_key);

                    return (
                        <div 
                            key={media.id} 
                            className="relative aspect-video bg-muted rounded-lg overflow-hidden border cursor-pointer group"
                            onClick={() => setPreviewItem({
                                url: mediaSrc,
                                type: media.media_type?.startsWith('image') ? 'image' : 'video'
                            })}
                        >
                            {media.media_type?.startsWith('image') ? (
                                <Image
                                    src={mediaSrc}
                                    alt="Portfolio Media"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            ) : (
                                <video
                                    src={`${mediaSrc}#t=0.1`}
                                    preload="metadata"
                                    playsInline
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            )}
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={handleUploadClick}
                    className="relative aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center cursor-pointer"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Upload Media</span>
                        </>
                    )}
                </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {previewItem && (
                <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-black/95 backdrop-blur-md rounded-2xl flex items-center justify-center relative aspect-video">
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
                                className="max-h-[85vh] max-w-full object-contain"
                            />
                        ) : (
                            <video
                                src={previewItem.url}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-[85vh] max-w-full"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {uploadProgress !== null && (
                <Dialog open={uploadProgress !== null}>
                    <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Uploading File</DialogTitle>
                        <p className="text-sm text-gray-500 mb-6 truncate max-w-full">
                            Uploading {fileInputRef.current?.files?.[0]?.name || "media"}...
                        </p>
                        <div className="w-full space-y-2">
                            <div className="flex justify-end text-xs font-semibold text-gray-700">
                                {uploadProgress}%
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-[#C69C2E] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
