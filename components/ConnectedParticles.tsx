"use client";
import { useEffect, useRef } from "react";

interface ConnectedParticlesProps {
  className?: string;
  count?: number; // number of nodes
  hue?: number; // base hue for theme (kept for compatibility)
  pace?: number; // 1 = normal, <1 slower, >1 faster
}

// Connected lines/triangles with subtle tracer trails in theme colors
export default function ConnectedParticles({ className = "", count = 48, hue = 200, pace = 0.15 }: ConnectedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let raf = 0;
    let w = 0, h = 0;

    function resize() {
      const cnv = canvasRef.current;
      const c = ctx;
      if (!cnv || !c) return;
      const rect = cnv.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      cnv.width = Math.floor(w * dpr);
      cnv.height = Math.floor(h * dpr);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    type Node = { x: number; y: number; vx: number; vy: number; z: number; a: number };
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12 * pace,
      vy: (Math.random() - 0.5) * 0.12 * pace,
      z: Math.random(),
      a: Math.random() * Math.PI * 2,
    }));

    const maxDist = Math.min(160, Math.max(120, Math.min(w, h) * 0.22));
    const hueA = 195; // cyan
    const hueB = 320; // pink
    let tframe = 0;

    function step() {
  const c = ctx;
      if (!c) return;
  tframe += 0.004 * pace; // overall pace
      // trail fade for tracer effect
      c.fillStyle = `rgba(0,0,0,0.08)`;
      c.fillRect(0, 0, w, h);

      // mild vignette glow base
  const grd = c.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      grd.addColorStop(0, `hsla(${hue}, 25%, 12%, 0.10)`);
      grd.addColorStop(1, `rgba(0,0,0,0)`);
  c.fillStyle = grd;
  c.fillRect(0, 0, w, h);

      // update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
  n.a += (0.0006 + n.z * 0.0012) * pace; // rotation paced
  // gentle flow paced
  n.vx += Math.cos(n.a) * 0.003 * (0.5 + n.z) * pace;
  n.vy += Math.sin(n.a * 1.2) * 0.003 * (0.5 + n.z) * pace;
        // bounds wrap
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const t = 1 - d / maxDist; // closeness factor
            const depth = (a.z + b.z) * 0.5;
            const alpha = 0.06 + t * 0.22 + depth * 0.08;
            // mix cyan/pink palette for connections
            const mix = (Math.sin(tframe * 1.2 + i * 0.3 + j * 0.17) + 1) * 0.5;
            const hMix = hueA * (1 - mix) + hueB * mix;
            c.strokeStyle = `hsla(${hMix}, 75%, ${48 + depth * 30}%, ${alpha})`;
            c.lineWidth = 0.6 + t * 1.2;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();

            // occasional triangle for 4D vibe
            if (t > 0.75 && Math.random() < 0.02) {
              const k = nodes[(j + 13) % nodes.length];
              c.beginPath();
              c.moveTo(a.x, a.y);
              c.lineTo(b.x, b.y);
              c.lineTo(k.x, k.y);
              c.closePath();
              const mix2 = (Math.cos(tframe * 0.9 + i * 0.19) + 1) * 0.5;
              const hTri = hueA * (1 - mix2) + hueB * mix2;
              c.strokeStyle = `hsla(${hTri}, 85%, ${55 + depth * 25}%, ${alpha * 0.6})`;
              c.lineWidth = 0.5;
              c.stroke();
            }
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const r = 1.2 + n.z * 2.2;
        const mixN = (Math.sin(tframe * 1.5 + n.x * 0.01 + n.y * 0.01) + 1) * 0.5;
        const hN = hueA * (1 - mixN) + hueB * mixN;
        c.fillStyle = `hsla(${hN}, 85%, ${58 + n.z * 24}%, ${0.35 + n.z * 0.35})`;
        c.beginPath();
        c.arc(n.x, n.y, r, 0, Math.PI * 2);
        c.fill();
      }

      raf = requestAnimationFrame(step);
    }

    // initialize background to black for smooth trails
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, w, h);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, hue]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />;
}
