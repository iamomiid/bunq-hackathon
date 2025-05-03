import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <img
      src="/logo.png" // Path to the logo image in the public folder
      alt="BudgetGuard Logo"
      className={cn("text-primary", className)}
      width={32}  // Set width
      height={32} // Set height
      {...props}
    />
  );
}
