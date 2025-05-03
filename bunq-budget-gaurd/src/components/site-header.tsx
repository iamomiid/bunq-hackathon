"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth-actions";

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <BrandLogo />
            <span className="font-bold text-xl text-primary">BudgetGuard</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {isDashboard ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-foreground transition-colors">
                Dashboard
              </Link>
              <Link
                href="/dashboard/create-limit"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Create Limit
              </Link>
            </>
          ) : (
            <>
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isDashboard ? (
            <Button size="sm" variant="outline" onClick={() => logoutAction()}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="hidden md:flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
