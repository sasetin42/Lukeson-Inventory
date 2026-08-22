'use client';

import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

interface ProductImageProps {
  path?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  'data-ai-hint'?: string;
  style?: React.CSSProperties;
}

export default function ProductImage({ path, alt, className, width = 48, height = 48, style, ...props }: ProductImageProps) {
  // If path is a valid URL, use it. Otherwise, show placeholder.
  const imageUrl = path && (path.startsWith('data:image') || path.startsWith('http')) 
    ? path 
    : `https://placehold.co/${width}x${height}.png`;
  
  const defaultStyle: React.CSSProperties = {
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    flexShrink: 0,
    ...style,
  };

  if (!path) {
    return (
        <Image
          src={`https://placehold.co/${width}x${height}.png`}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={defaultStyle}
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
      style={defaultStyle}
      {...props}
      unoptimized
    />
  );
}
