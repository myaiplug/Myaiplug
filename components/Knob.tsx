'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

type KnobProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number; // px
  onChange: (v: number) => void;
  label?: string;
  // Branding colors
  fillColor?: string; // active arc color
  trackColor?: string; // inactive arc color
  faceColor?: string; // knob face base color
  pointerColor?: string;
  showTicks?: boolean;
};

// Map value in [min,max] to angle in degrees across a 270° sweep (135° to 405°)
function valueToAngle(value: number, min: number, max: number) {
  const start = 135; // degrees
  const sweep = 270; // degrees
  const t = (value - min) / (max - min);
  return start + t * sweep;
}

function angleToValue(angle: number, min: number, max: number) {
  const start = 135;
  const sweep = 270;
  // Normalize angle into [start, start+sweep]
  let a = angle;
  while (a < start) a += 360;
  while (a > start + sweep) a -= 360;
  const t = (a - start) / sweep;
  return min + t * (max - min);
}

export default function Knob({
  value,
  min,
  max,
  step = (max - min) / 100,
  size = 96,
  onChange,
  label,
  fillColor = '#7C4DFF',
  trackColor = '#2f2f2f',
  faceColor = '#1a1a1f',
  pointerColor = '#ffffff',
  showTicks = true,
}: KnobProps) {
  const radius = size / 2;
  const strokeW = Math.max(6, Math.floor(size * 0.08));
  const arcR = radius - strokeW / 2 - 4;
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const angle = useMemo(() => valueToAngle(value, min, max), [value, min, max]);

  const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const startAngle = 135;
  const endAngle = 405; // 135 + 270
  const currentAngle = angle;

  const arcTrack = describeArc(radius, radius, arcR, startAngle, endAngle);
  const arcActive = describeArc(radius, radius, arcR, startAngle, currentAngle);

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let a = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // convert to knob coords
      if (a < 0) a += 360;
      // clamp to sweep
      const start = startAngle;
      const end = endAngle;
      // Snap to nearest within 270° sweep by projecting out-of-range to bounds
      const inRange = (deg: number) => deg >= start && deg <= end;
      if (!inRange(a)) {
        // find closer bound
        const dStart = Math.min(Math.abs(a - start), Math.abs(a + 360 - start));
        const dEnd = Math.min(Math.abs(end - a), Math.abs(end - (a - 360)));
        a = dStart < dEnd ? start : end;
      }
      const newVal = Math.min(max, Math.max(min, angleToValue(a, min, max)));
      // apply step
      const stepped = Math.round(newVal / step) * step;
      onChange(Number(stepped.toFixed(4)));
    },
    [min, max, step, onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    handlePointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    handlePointer(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
    if (delta !== 0) {
      e.preventDefault();
      const next = Math.min(max, Math.max(min, value + delta));
      onChange(Number(next.toFixed(4)));
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div
        ref={containerRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id="knobFaceGrad" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#2a2a33" />
              <stop offset="60%" stopColor={faceColor} />
              <stop offset="100%" stopColor="#0d0d10" />
            </radialGradient>
            <linearGradient id="knobEdgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#444" />
              <stop offset="100%" stopColor="#111" />
            </linearGradient>
            <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" />
            </filter>
          </defs>

          {/* Outer edge */}
          <circle cx={radius} cy={radius} r={radius - 1} fill="url(#knobEdgeGrad)" />
          {/* Face */}
          <circle cx={radius} cy={radius} r={radius - 4} fill="url(#knobFaceGrad)" filter="url(#knobShadow)" />

          {/* Track (full arc) */}
          <path d={arcTrack} stroke={trackColor} strokeWidth={strokeW} strokeLinecap="round" fill="none" opacity="0.9" />
          {/* Active value arc */}
          <path d={arcActive} stroke={fillColor} strokeWidth={strokeW} strokeLinecap="round" fill="none" />

          {/* Ticks */}
          {showTicks && (
            <g opacity="0.4">
              {Array.from({ length: 10 }).map((_, i) => {
                const deg = startAngle + (i * (endAngle - startAngle)) / 9;
                const p1 = polarToCartesian(radius, radius, arcR + strokeW / 2 + 2, deg);
                const p2 = polarToCartesian(radius, radius, arcR + strokeW / 2 + 8, deg);
                return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#888" strokeWidth={2} />;
              })}
            </g>
          )}

          {/* Pointer */}
          {(() => {
            const pr = arcR - 10;
            const p = polarToCartesian(radius, radius, pr, currentAngle);
            const base = polarToCartesian(radius, radius, pr - 14, currentAngle);
            return <line x1={base.x} y1={base.y} x2={p.x} y2={p.y} stroke={pointerColor} strokeWidth={4} strokeLinecap="round" />;
          })()}

          {/* Subtle center highlight */}
          <circle cx={radius} cy={radius} r={Math.max(6, radius * 0.1)} fill="#ffffff" opacity="0.06" />
        </svg>
      </div>
      {label && <div className="mt-2 text-sm font-semibold">{label}</div>}
      <div className="text-xs text-gray-500">{value.toFixed(1)}</div>
    </div>
  );
}
