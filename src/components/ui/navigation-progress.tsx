'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route change finishes
    if (loading) {
      setProgress(100);
      const timeout = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleLinkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const isExternal = target.getAttribute('target') === '_blank' || (href && (href.startsWith('http') || href.startsWith('mailto:')));
      const isAnchor = href?.startsWith('#');

      if (href && !isExternal && !isAnchor && href !== pathname) {
        setLoading(true);
        setProgress(30);

        clearInterval(timer);
        timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              clearInterval(timer);
              return 85;
            }
            return prev + Math.floor(Math.random() * 15 + 8);
          });
        }, 120);
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      clearInterval(timer);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3.5px] pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #578A00 0%, #10A3D8 50%, #054B8C 100%)',
          boxShadow: '0 0 12px rgba(16, 163, 216, 0.8), 0 0 6px rgba(87, 138, 0, 0.8)',
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
