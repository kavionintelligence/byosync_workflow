import { Navbar } from "@/components/landing/navbar";
import { WaitlistSection } from "@/components/landing/waitlist";

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <Navbar />
      <WaitlistSection />
    </main>
  );
}