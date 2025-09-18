
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SiteSettings, Menu } from "@/lib/data";


type SiteHeaderProps = {
  settings: SiteSettings;
  headerMenu?: Menu;
};

export default function SiteHeader({ settings, headerMenu }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(query || "");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className={cn("flex-1 md:flex-none transition-all duration-300", isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
            <Icons.logo className="h-6 w-6" />
            {settings.siteName || "Vinee CMS"}
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className={cn(
          "hidden flex-1 items-center justify-end space-x-2 md:flex transition-all duration-300",
          isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
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

        {/* Search Bar */}
        <div className="flex flex-1 items-center justify-end">
            <form 
              onSubmit={handleSearchSubmit} 
              className={cn(
                "relative w-full transition-all duration-300 md:w-auto",
                isSearchOpen ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none md:opacity-100 md:w-auto md:pointer-events-auto"
              )}
            >
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search posts..."
                className="h-9 md:w-48 md:focus:w-64 transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9 md:hidden" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </form>

            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

          {/* Mobile Menu */}
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                </SheetHeader>
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
                      <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium hover-bg-accent" onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
