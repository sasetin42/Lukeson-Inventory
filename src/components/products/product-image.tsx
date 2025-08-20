
'use client';

import Image from 'next/image';
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
  // If path is a base64 string, use it directly. Otherwise, show placeholder.
  const imageUrl = path && (path.startsWith('data:image') || path.startsWith('http')) ? path : `https://placehold.co/${width}x${height}.png`;
  
  if (!path) {
    return (
        <Image
          src={`https://placehold.co/${width}x${height}.png`}
          alt={alt}
          width={width}
          height={height}
          className={className}
          {...props}
        />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
      unoptimized // Add this if you are using external images without loader configuration
    />
  );
}
