import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WaitlistSection } from "@/components/landing/waitlist";
import { SolutionStackSection } from "@/components/landing/solution-stack";
import {
  BeforeAfterSection,
  ProblemSection,
  TrustWorkflowSection,
} from "@/components/landing/trust-landing";
import { LANDING_FINAL_CTA } from "@/lib/landing-content";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-blue-950 selection:bg-blue-200/50">
      <Navbar />

      <main>
        <Hero />
        <ProblemSection />
        <SolutionStackSection />
        <TrustWorkflowSection />
        <BeforeAfterSection />
      </main>

      <div id="waitlist" className="scroll-mt-24 md:scroll-mt-28">
        <WaitlistSection />
      </div>

      <footer className="border-t border-blue-100/60 bg-white py-12 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:gap-8 sm:px-6">
          <div className="group flex flex-col items-center gap-3">
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="ByoSync Logo"
                fill
                sizes="40px"
                className="object-contain opacity-80 transition-opacity group-hover:opacity-100"
              />
            </div>
            <span className="text-lg font-bold tracking-tighter text-blue-900">ByoSync</span>
          </div>

          <p className="max-w-md text-center font-sans text-sm leading-relaxed text-blue-700">
            {LANDING_FINAL_CTA.subline}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-widest text-blue-600 sm:gap-x-8 sm:text-[11px]">
            <a href="#solution" className="transition-colors hover:text-blue-700">
              Product
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-blue-700">
              How it works
            </a>
            <a href="mailto:hello@byosync.io" className="transition-colors hover:text-blue-700">
              Contact
            </a>
          </div>

          <div className="h-px w-full max-w-xs bg-linear-to-r from-transparent via-blue-300/30 to-transparent" />

          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-[10px] tracking-wider text-blue-500">
              © {new Date().getFullYear()} BYOSYNC INFRASTRUCTURE LAYER
            </p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px] uppercase tracking-tighter text-blue-500">Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
