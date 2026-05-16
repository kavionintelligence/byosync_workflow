import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CodePreview } from "@/components/landing/code-preview";
import { WaitlistSection } from "@/components/landing/waitlist";
import { SystemFlowDemo } from "@/components/landing/system-flow-demo";
import { PlatformPreview } from "@/components/landing/platform-preview";
import Image from "next/image";

/**
 * BYOSYNC LANDING PAGE
 * --------------------
 * Font: Open Sans (inherited from layout.tsx)
 * Theme: Tailwind v4 / OKLCH
 * Infrastructure: Next.js 14/15 App Router
 */

export default function LandingPage() {
  return (
      <div
        className="relative min-h-screen bg-white text-blue-950 selection:bg-blue-200/50 overflow-x-hidden"
      >
      
      {/* 1. Navigation Header */}
      <Navbar />

      <main>
        {/* 2. Hero Section: Direct value proposition */}
        <Hero />

        {/* 3. Platform Preview: Scroll-driven dashboard showcase */}
        <PlatformPreview />

        {/* System Flow: full interactive animated architecture — embedded inline */}
        <SystemFlowDemo />

        {/* 3. Social Proof / Trusted By Bar (Optional) */}
        

        {/* 4. Infrastructure Features: The 3 pillars of ByoSync */}
        <div id="infra">
          <Features />
        </div>

        {/* 5. Developer Experience: Code terminal & API explanation */}
        <CodePreview />

      </main>
      <div id="waitlist" className="scroll-mt-20"> 
          <WaitlistSection />
        </div>

      {/* 7. Footer: Minimal & Professional */}
      <footer className="py-20 border-t border-blue-100/60 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
        
        {/* Logo & Name */}
        <div className="flex flex-col items-center gap-3 group">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
            <Image 
              src="/logo.png" 
              alt="ByoSync Logo" 
              fill
              className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="font-bold text-lg tracking-tighter text-blue-900">
            ByoSync
          </span>
        </div>

        {/* Brand Mission */}
        <p className="text-blue-700 text-sm font-sans max-w-sm text-center leading-relaxed">
          The foundational trust layer for India's digital ecosystem. 
          Zero-biometric, hardware-free, and privacy-preserving by design.
        </p>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] uppercase tracking-widest text-blue-600 font-semibold">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Framework</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Developer Terms</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Security Compliance</a>
          <a href="mailto:hello@byosync.io" className="hover:text-blue-600 transition-colors">Contact Support</a>
        </div>

        {/* Divider line */}
        <div className="w-full max-w-xs h-px bg-linear-to-r from-transparent via-blue-300/30 to-transparent" />

        {/* Copyright & Timestamp */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-blue-500 text-[10px] font-mono tracking-wider">
            © {new Date().getFullYear()} BYOSYNC INFRASTRUCTURE LAYER
          </p>
          <div className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] text-blue-500 font-mono uppercase tracking-tighter">Systems Operational</span>
          </div>
        </div>
        
      </div>
    </footer>

    </div>
  );
}