"use client";

// DEPRECATED: This component has been replaced by Next.js layout files.
// Please use the appropriate layout file in src/app/[section]/layout.tsx instead.
// The PageHeader component should be used within pages for consistent title and action areas.

import React from "react";
import { SiteHeader } from "@/components/site-header";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export function PageLayout({ children, title, action }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen mx-auto max-w-7xl">
      <SiteHeader isAuthenticated={false} />

      <main className="flex-1 container max-w-6xl py-10">
        {(title || action) && (
          <div className="flex justify-between items-center mb-8">
            {title && <h1 className="text-3xl font-bold">{title}</h1>}
            {action && <div>{action}</div>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
