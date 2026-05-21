import { Navbar } from "@/components/landing/navbar";
import { SystemFlowDemo } from "@/components/landing/system-flow-demo";

export const metadata = {
  title: "ByoSync — System Flow",
  description: "How one face scan, one signed assertion, and a user-owned vault replace the database every Indian company is afraid to keep.",
};

export default function SystemFlowPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#07080f] text-slate-50">
      {/* Shared navigation bar from the main app */}
      <Navbar />

      {/* Full-viewport demo — fits below navbar without page scroll */}
      <SystemFlowDemo mode="fullscreen" />
    </div>
  );
}
