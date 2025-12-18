"use client";

import * as React from "react";
import Link from "next/link";

import { Menu, X } from "lucide-react";

import { siteConfig } from "@/shared/config/site";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

const navItems = siteConfig.ui.navigation.items;

export function SiteHeader() {
  const [activeHash, setActiveHash] = React.useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const mobileMenuTitleId = React.useId();

  React.useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  React.useEffect(() => {
    if (!isMobileMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <div className="min-w-0">
            <div className="truncate text-sm leading-none font-semibold tracking-tight">
              {siteConfig.name}
            </div>
            <div className="text-muted-foreground truncate text-xs">
              {siteConfig.headline}
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = activeHash === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-muted-foreground hover:text-foreground text-sm transition-colors",
                    isActive && "text-foreground",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={siteConfig.ui.navigation.openMenuAriaLabel}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "md:hidden",
              )}
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {siteConfig.ui.navigation.githubLabel}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={siteConfig.ui.navigation.closeMenuAriaLabel}
            className="bg-background/80 absolute inset-0 backdrop-blur"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={mobileMenuTitleId}
            className="bg-background absolute top-0 right-0 h-full w-72 border-l p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div id={mobileMenuTitleId} className="text-sm font-semibold">
                {siteConfig.ui.navigation.mobileMenuTitle}
              </div>
              <button
                type="button"
                aria-label={siteConfig.ui.navigation.closeMenuAriaLabel}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeHash === item.href;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
