import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 10C9.67157 10 9 10.6716 9 11.5V20.5C9 21.3284 9.67157 22 10.5 22H21.5C22.3284 22 23 21.3284 23 20.5V15.5C23 14.6716 22.3284 14 21.5 14H17V11.5C17 10.6716 16.3284 10 15.5 10H10.5ZM15 14V12H11V14H15ZM11 16H21V20H11V16Z"
        fill="white"
      />
    </svg>
  );
} 