"use client";
import { useEffect, useRef } from "react";

interface GeometryParticlesProps {
  className?: string;
  density?: number; // number of particles
  hue?: number; // base hue
}

// Lightweight, no external libs. Draws rotating pseudo-3D triangles & lines.
export default function GeometryParticles({ className = "", density = 28, hue = 265 }: GeometryParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (!ctx) return; // TS safety
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: density }).map(() => ({
      r: 40 + Math.random() * 160,
      a: Math.random() * Math.PI * 2,
      z: Math.random() * 1,
      speed: 0.002 + Math.random() * 0.004,
      shape: Math.random() < 0.5 ? "tri" : "dot",
    }));

    function render() {
      if (!canvas || !ctx) return; // safety
      frame++;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      for (const p of particles) {
        p.a += p.speed;
        const x = cx + Math.cos(p.a) * p.r * (0.6 + p.z * 0.4);
        const y = cy + Math.sin(p.a * 1.3) * p.r * 0.35 * (0.6 + p.z * 0.4);
        const depth = 0.3 + p.z * 0.7;
        const alpha = 0.15 + depth * 0.55;
        const sat = 55 + depth * 35;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.a + frame * 0.002 * (p.z + 0.2));
        if (p.shape === "tri") {
          const size = 6 + depth * 10;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.75, size * 0.8);
            ctx.lineTo(-size * 0.75, size * 0.8);
            ctx.closePath();
            ctx.strokeStyle = `hsla(${hue + depth * 20}, ${sat}%, ${50 + depth * 25}%, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        } else {
          const r = 2 + depth * 3.5;
          ctx.fillStyle = `hsla(${hue + depth * 20}, ${sat}%, ${55 + depth * 25}%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        }
  ctx.restore();
      }
      // subtle cross lines
  ctx.strokeStyle = `hsla(${hue},40%,60%,0.08)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.stroke();
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density, hue]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />;
}