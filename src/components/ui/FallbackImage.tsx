"use client";

import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  className?: string;
  username?: string;
  isAvatar?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const normalizeUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const cleanBaseUrl = BASE_URL.replace("0.0.0.0", "127.0.0.1");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBaseUrl}${path}`;
};

const FallbackImage: React.FC<FallbackImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc, 
  className, 
  username,
  isAvatar,
  ...props 
}) => {
  const normalized = normalizeUrl(src as string | undefined);
  const [imgSrc, setImgSrc] = useState<string | undefined>(normalized);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updatedNormalized = normalizeUrl(src as string | undefined);
    setImgSrc(updatedNormalized);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name === "Avatar") return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const isUserAvatar = isAvatar || !!username || alt === "Avatar" || (alt && alt !== "DGE Logo Placeholder" && className?.includes("rounded-full"));

  if ((hasError || !imgSrc) && isUserAvatar) {
    const initials = getInitials(username || alt || "User");
    let textSize = "text-base";
    if (className?.includes("w-6") || className?.includes("h-6") || className?.includes("w-8") || className?.includes("h-8") || className?.includes("w-full") || className?.includes("h-full")) {
      textSize = "text-xs";
    } else if (className?.includes("w-24") || className?.includes("h-24") || className?.includes("w-28") || className?.includes("h-28") || className?.includes("w-32") || className?.includes("h-32")) {
      textSize = "text-3xl sm:text-4xl";
    }

    return (
      <div 
        className={`flex items-center justify-center bg-[#C69C2E] text-white font-bold select-none rounded-full ${className}`}
      >
        <span className={textSize}>{initials}</span>
      </div>
    );
  }

  if (hasError && !fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <img src="/DGE logo.png" alt="DGE Logo Placeholder" className="w-10 h-auto opacity-50 grayscale" />
          <ImageOff className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default FallbackImage;
