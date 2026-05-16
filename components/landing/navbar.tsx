"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const pathname = usePathname();
  const isSystemFlow = pathname === "/system-flow";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-blue-100/60 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="relative mx-auto flex max-w-7xl min-h-14 items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:px-6 sm:py-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="ByoSync Logo"
            width={32}
            height={32}
            className="size-7 shrink-0 object-contain sm:size-8"
            priority
          />
          <span className="truncate text-lg font-bold tracking-tighter text-blue-950 sm:text-xl">
            ByoSync
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex md:gap-6">
          <Link
            href="/system-flow"
            className={`text-[11px] font-mono uppercase tracking-[0.2em] transition-colors sm:tracking-[0.25em] ${
              isSystemFlow
                ? "text-blue-600"
                : "text-blue-600/70 hover:text-blue-900"
            }`}
          >
            System Flow
          </Link>
          <a href={isSystemFlow ? "/#waitlist" : "#waitlist"}>
            <Button className="rounded-full bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 active:scale-95 sm:px-6">
              Join Waitlist
            </Button>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-900 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {menuOpen ? (
        <div className="border-b border-blue-100/80 bg-white/98 px-4 py-4 shadow-sm md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/system-flow"
              className={`rounded-xl px-3 py-3 text-sm font-medium ${
                isSystemFlow ? "bg-blue-50 text-blue-700" : "text-blue-900"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              System Flow
            </Link>
            <a
              href={isSystemFlow ? "/#waitlist" : "#waitlist"}
              onClick={() => setMenuOpen(false)}
            >
              <Button className="w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700">
                Join Waitlist
              </Button>
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
};
