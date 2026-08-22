import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M5.10 3.97 C5.35 3.4 5.88 3 6.5 3 H17.5 C18.12 3 18.65 3.4 18.9 3.97 L21 8 H3 L5.10 3.97 Z"
            fill="currentColor"
            className="text-primary/50"
        ></path>
        <path
            d="M19 9 L17 15 H7 L5 9 H19 Z"
            fill="currentColor"
            className="text-primary/70"
        ></path>
        <path
            d="M17 16 L15 22 H9 L7 16 H17 Z"
            fill="currentColor"
            className="text-primary"
        ></path>
    </svg>
  );
}
