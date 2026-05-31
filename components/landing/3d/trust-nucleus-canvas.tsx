"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { TrustNucleusScene } from "./trust-nucleus-scene";
import { WebGLErrorBoundary } from "./webgl-error-boundary";

interface TrustNucleusCanvasProps {
  className?: string;
  mouse?: { x: number; y: number };
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 bg-linear-to-b from-blue-50/80 via-white to-white" aria-hidden />
  );
}

export function TrustNucleusCanvas({ className = "", mouse = { x: 0, y: 0 } }: TrustNucleusCanvasProps) {
  return (
    <WebGLErrorBoundary fallback={<SceneFallback />}>
      <div className={`relative ${className}`}>
        <Canvas
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ position: [0, 1.2, 6.5], fov: 42, near: 0.1, far: 40 }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.toneMappingExposure = 1.15;
          }}
        >
          <Suspense fallback={null}>
            <TrustNucleusScene mouse={mouse} />
          </Suspense>
        </Canvas>
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-white"
          aria-hidden
        />
      </div>
    </WebGLErrorBoundary>
  );
}
