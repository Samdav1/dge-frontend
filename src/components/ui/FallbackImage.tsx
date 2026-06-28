"use client";

import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  className?: string;
}

const FallbackImage: React.FC<FallbackImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc, 
  className, 
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src as string | undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src as string | undefined);
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
