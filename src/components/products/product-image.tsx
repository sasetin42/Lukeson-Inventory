
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Skeleton } from '../ui/skeleton';

interface ProductImageProps {
  path?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  'data-ai-hint'?: string;
}

export default function ProductImage({ path, alt, className, width = 48, height = 48, ...props }: ProductImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (path) {
      const imageRef = ref(storage, path);
      getDownloadURL(imageRef)
        .then((url) => {
          if (isMounted) {
            setImageUrl(url);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error getting image URL:", error);
          if (isMounted) {
            setImageUrl(null); // Fallback or error image can be set here
            setLoading(false);
          }
        });
    } else {
        setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [path]);

  if (loading) {
      return <Skeleton className={className} style={{ width, height }} />;
  }

  return (
    <Image
      src={imageUrl || `https://placehold.co/${width}x${height}.png`}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}
