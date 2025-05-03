"use client";

import React from "react";
import { SiteHeader } from "@/components/site-header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen mx-auto max-w-7xl">
      <SiteHeader />
      {children}
    </div>
  );
} 