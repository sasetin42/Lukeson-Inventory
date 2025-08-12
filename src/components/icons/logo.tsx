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
            d="M5.10_3.97_C5.35_3.4_5.88_3_6.5_3_H17.5_C18.12_3_18.65_3.4_18.9_3.97_L21_8_H3_L5.10_3.97_Z"
            fill="currentColor"
            className="text-primary/50"
        ></path>
        <path
            d="M19_9_L17_15_H7_L5_9_H19_Z"
            fill="currentColor"
            className="text-primary/70"
        ></path>
        <path
            d="M17_16_L15_22_H9_L7_16_H17_Z"
            fill="currentColor"
            className="text-primary"
        ></path>
    </svg>
  );
}
