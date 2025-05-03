import React from "react";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
    return;
  }

  return (
    <div className="flex flex-col min-h-screen mx-auto max-w-7xl">
      <SiteHeader />

      <main className="flex-1 container py-10">{children}</main>
    </div>
  );
}
