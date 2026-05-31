"use client";

import { useEffect, useRef } from "react";

type Segment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  len: number;
};

type Pulse = {
  seg: number;
  t: number;
  speed: number;
  trail: number;
  width: number;
  forward: boolean;
};

type Node = { x: number; y: number; chip?: boolean };

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildCircuit(w: number, h: number, seed = 42) {
  const rand = seededRandom(seed);
  const cols = Math.max(10, Math.floor(w / 88));
  const rows = Math.max(8, Math.floor(h / 72));
  const padX = w * 0.06;
  const padY = h * 0.08;
  const stepX = (w - padX * 2) / (cols - 1);
  const stepY = (h - padY * 2) / (rows - 1);

  const nodes: Node[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jitterX = (rand() - 0.5) * stepX * 0.08;
      const jitterY = (rand() - 0.5) * stepY * 0.08;
      nodes.push({
        x: padX + c * stepX + jitterX,
        y: padY + r * stepY + jitterY,
        chip: rand() > 0.94,
      });
    }
  }

  const idx = (c: number, r: number) => r * cols + c;
  const segments: Segment[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (rand() > 0.22) continue;
      const a = nodes[idx(c, r)];
      const b = nodes[idx(c + 1, r)];
      segments.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        len: Math.hypot(b.x - a.x, b.y - a.y),
      });
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > 0.28) continue;
      const a = nodes[idx(c, r)];
      const b = nodes[idx(c, r + 1)];
      segments.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        len: Math.hypot(b.x - a.x, b.y - a.y),
      });
    }
  }

  const key = (x: number, y: number) => `${Math.round(x)}:${Math.round(y)}`;
  const endMap = new Map<string, number[]>();
  segments.forEach((s, i) => {
    for (const k of [key(s.x1, s.y1), key(s.x2, s.y2)]) {
      if (!endMap.has(k)) endMap.set(k, []);
      endMap.get(k)!.push(i);
    }
  });

  const adjacency: number[][] = segments.map((_, i) => {
    const s = segments[i];
    const peers = new Set([
      ...(endMap.get(key(s.x1, s.y1)) ?? []),
      ...(endMap.get(key(s.x2, s.y2)) ?? []),
    ]);
    peers.delete(i);
    return [...peers];
  });

  return { segments, nodes, adjacency };
}

function spawnPulse(segments: Segment[], rand: () => number): Pulse {
  return {
    seg: Math.floor(rand() * segments.length),
    t: rand(),
    speed: 0.0025 + rand() * 0.0045,
    trail: 0.08 + rand() * 0.14,
    width: 1.2 + rand() * 1.4,
    forward: rand() > 0.5,
  };
}

interface CircuitBackgroundProps {
  className?: string;
  intensity?: number;
  pulseCount?: number;
}

export function CircuitBackground({
  className = "",
  intensity = 1,
  pulseCount = 48,
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let segments: Segment[] = [];
    let nodes: Node[] = [];
    let adjacency: number[][] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    const rand = seededRandom(20260531);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const circuit = buildCircuit(w, h, Math.floor(w * 13 + h * 7));
      segments = circuit.segments;
      nodes = circuit.nodes;
      adjacency = circuit.adjacency;
      pulses = Array.from({ length: Math.min(pulseCount, segments.length || pulseCount) }, () =>
        spawnPulse(segments, rand)
      );
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#fafbff");
      bg.addColorStop(0.5, "#ffffff");
      bg.addColorStop(1, "#eff6ff");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `rgba(37, 99, 235, ${0.07 * intensity})`;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      segments.forEach((s) => {
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
      });
      ctx.stroke();

      nodes.forEach((n) => {
        if (n.chip) {
          ctx.fillStyle = "rgba(219, 234, 254, 0.55)";
          ctx.strokeStyle = "rgba(37, 99, 235, 0.18)";
          ctx.lineWidth = 1;
          const cw = 18;
          const ch = 10;
          ctx.beginPath();
          ctx.roundRect(n.x - cw / 2, n.y - ch / 2, cw, ch, 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "rgba(37, 99, 235, 0.25)";
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(n.x - cw / 2 + 3 + i * 4, n.y - 1, 2, 2);
          }
        } else {
          ctx.fillStyle = "rgba(37, 99, 235, 0.12)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const drawPulse = (p: Pulse) => {
      const s = segments[p.seg];
      if (!s) return;

      const tHead = p.forward ? p.t : 1 - p.t;
      const tTail = p.forward ? Math.max(0, p.t - p.trail) : Math.min(1, p.t + p.trail);

      const x0 = s.x1 + (s.x2 - s.x1) * (p.forward ? tTail : 1 - tTail);
      const y0 = s.y1 + (s.y2 - s.y1) * (p.forward ? tTail : 1 - tTail);
      const x1 = s.x1 + (s.x2 - s.x1) * tHead;
      const y1 = s.y1 + (s.y2 - s.y1) * tHead;

      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;
      const dist = Math.hypot((x0 + x1) / 2 - mx, (y0 + y1) / 2 - my);
      const boost = Math.max(0, 1 - dist / 280) * 0.35;

      ctx.save();
      ctx.shadowColor = "rgba(59, 130, 246, 0.85)";
      ctx.shadowBlur = 10 + boost * 8;
      ctx.lineWidth = p.width + boost;
      ctx.lineCap = "round";

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, "rgba(37, 99, 235, 0)");
      grad.addColorStop(0.35, `rgba(59, 130, 246, ${0.25 + boost})`);
      grad.addColorStop(1, `rgba(147, 197, 253, ${0.95 + boost * 0.05})`);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 + boost})`;
      ctx.beginPath();
      ctx.arc(x1, y1, 1.8 + boost, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const advancePulse = (p: Pulse) => {
      p.t += p.speed * (p.forward ? 1 : -1);
      if (p.t > 1 || p.t < 0) {
        const next = adjacency[p.seg];
        if (next.length > 0) {
          p.seg = next[Math.floor(rand() * next.length)];
          p.t = p.forward ? 0.02 : 0.98;
        } else {
          p.t = rand();
        }
      }
    };

    const tick = () => {
      drawStatic();

      if (!reduced && segments.length > 0) {
        pulses.forEach((p) => {
          advancePulse(p);
          drawPulse(p);
        });
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [intensity, pulseCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ zIndex: 1, pointerEvents: "none" }}
      aria-hidden
    />
  );
}
