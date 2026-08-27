import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="lukesonLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A3BAA" />
          <stop offset="100%" stopColor="#054B8C" />
        </linearGradient>
        <linearGradient id="lukesonLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      
      {/* Icon Badge */}
      <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#lukesonLogoGrad)" />
      <path d="M11 29L20 9L29 29Z" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15 23H25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="19" r="3" fill="url(#lukesonLogoGold)" />
      
      {/* Brand Text */}
      <text x="44" y="22" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="14" fontWeight="900" fill="#0A3BAA" letterSpacing="0.5">LUKESON</text>
      <text x="44" y="32" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="5.5" fontWeight="700" fill="#64748B" letterSpacing="1">LIGHTING &amp; SERVICES</text>
    </svg>
  );
}
