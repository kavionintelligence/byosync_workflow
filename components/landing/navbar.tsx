"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const pathname = usePathname();
  const isSystemFlow = pathname === "/system-flow";

  return (
    <nav className="fixed w-full z-50 border-b border-blue-100/60 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ByoSync Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tighter text-blue-950">
            ByoSync
          </span>
        </Link>

        {/* Nav links + CTA */}
        <div className="flex items-center gap-6">
          <Link
            href="/system-flow"
            className={`text-[11px] font-mono tracking-[0.25em] uppercase transition-colors ${
              isSystemFlow
                ? "text-blue-600"
                : "text-blue-600/70 hover:text-blue-900"
            }`}
          >
            System Flow
          </Link>
          <a href={isSystemFlow ? "/#waitlist" : "#waitlist"}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 transition-all active:scale-95">
              Join Waitlist
            </Button>
          </a>
        </div>

      </div>
    </nav>
  );
};