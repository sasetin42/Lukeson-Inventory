import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 20V10" />
      <path d="M18 20V4" />
      <path d="M12 20v-4" />
      <path d="m4 10 8-8 8 8" />
      <path d="M2 10h20" />
    </svg>
  );
}
