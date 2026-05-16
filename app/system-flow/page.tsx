import { Navbar } from "@/components/landing/navbar";
import { SystemFlowDemo } from "@/components/landing/system-flow-demo";

export const metadata = {
  title: "ByoSync — System Flow",
  description: "How one face scan, one signed assertion, and a user-owned vault replace the database every Indian company is afraid to keep.",
};

export default function SystemFlowPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#07080f] text-slate-50">
      {/* Shared navigation bar from the main app */}
      <Navbar />

      {/* Spacer to push content below fixed navbar */}
      <div className="h-16" />

      {/* Full interactive system-flow demo */}
      <SystemFlowDemo />

      {/* Minimal footer */}
      <footer className="border-t border-white/5 bg-[#07080f] py-8 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-slate-600 text-[10px] font-mono tracking-widest uppercase">
            © {new Date().getFullYear()} ByoSync Infrastructure Layer
          </p>
          <a
            href="/"
            className="text-[11px] font-mono tracking-widest uppercase text-slate-500 hover:text-brand-blue transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </footer>
    </div>
  );
}
