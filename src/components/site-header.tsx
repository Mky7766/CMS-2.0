
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu as MenuIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { SiteSettings, Menu } from "@/lib/data";

type SiteHeaderProps = {
  settings: SiteSettings;
  headerMenu?: Menu;
};

export default function SiteHeader({ settings, headerMenu }: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex-1 md:flex-none">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
            <Icons.logo className="h-6 w-6" />
            {settings.siteName || "Vinee CMS"}
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden flex-1 items-center justify-end space-x-2 md:flex">
          {headerMenu ? (
            headerMenu.items.map((item, index) => (
              <Button key={index} variant="ghost" asChild>
                <Link href={item.url}>{item.label}</Link>
              </Button>
            ))
          ) : (
            <Button asChild>
              <Link href="/admin">Dashboard</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="flex flex-1 items-center justify-end md:hidden">
           <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="p-4">
                <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Icons.logo className="h-6 w-6" />
                  <span>{settings.siteName || "Vinee CMS"}</span>
                </Link>
                <nav className="flex flex-col space-y-2">
                  {headerMenu ? (
                    headerMenu.items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.url}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
