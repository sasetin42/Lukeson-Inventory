'use client';

import Image from 'next/image';

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
  const defaultStyle: React.CSSProperties = {
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    flexShrink: 0,
    ...style,
  };

  // For data URLs: plain <img> — next/image cannot optimize them and fires aspect-ratio warnings
  if (path && path.startsWith('data:image')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={path}
        alt={alt}
        className={className}
        style={defaultStyle}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  // For real remote URLs: use next/image for optimization
  if (path && path.startsWith('http')) {
    return (
      <Image
        src={path}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={defaultStyle}
        unoptimized
        {...props}
      />
    );
  }

  // Fallback placeholder
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://placehold.co/${width}x${height}.png`}
      alt={alt}
      className={className}
      style={defaultStyle}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
}
