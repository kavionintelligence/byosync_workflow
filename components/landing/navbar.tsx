"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_URL = "https://datasharing.byosync.in/";

const navLinkBtn =
  "h-auto rounded-full border border-transparent bg-transparent px-4 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-none transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98] sm:tracking-[0.25em]";

const navLinkBtnActive =
  "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700";

const navCtaBtn =
  "h-auto rounded-full border border-blue-600 bg-blue-600 px-5 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white shadow-none transition-all hover:border-blue-700 hover:bg-blue-700 hover:text-white active:scale-[0.98] sm:px-6 sm:tracking-[0.25em]";

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
        <div className="hidden items-center gap-2 md:flex md:gap-3">
          <Button asChild variant="ghost" className={navLinkBtn}>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              Demo
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={`${navLinkBtn} ${isSystemFlow ? navLinkBtnActive : ""}`}
          >
            <Link href="/system-flow">System Flow</Link>
          </Button>
          <Button asChild className={navCtaBtn}>
            <a href={isSystemFlow ? "/#waitlist" : "#waitlist"}>
              Join Waitlist
            </a>
          </Button>
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
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="ghost"
              className={`${navLinkBtn} w-full justify-center`}
            >
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Demo
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`${navLinkBtn} w-full justify-center ${isSystemFlow ? navLinkBtnActive : ""}`}
            >
              <Link href="/system-flow" onClick={() => setMenuOpen(false)}>
                System Flow
              </Link>
            </Button>
            <Button asChild className={`${navCtaBtn} w-full justify-center`}>
              <a
                href={isSystemFlow ? "/#waitlist" : "#waitlist"}
                onClick={() => setMenuOpen(false)}
              >
                Join Waitlist
              </a>
            </Button>
          </div>
        </div>
      ) : null}
    </nav>
  );
};
