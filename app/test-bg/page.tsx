import { WaveBackground } from "@/components/landing/WaveBackground";

export default function TestPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <WaveBackground />
      
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-2xl">
          WAVE INFRASTRUCTURE
        </h1>
        <p className="text-white/70 mt-4 font-mono uppercase tracking-[0.4em]">
          ByoSync Handshake Protocol
        </p>
      </div>
    </main>
  );
}