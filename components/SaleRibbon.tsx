"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SaleRibbonProps {
  endsAt?: Date; // if omitted, defaults to now + 48h
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function SaleRibbon({ endsAt }: SaleRibbonProps) {
  const [deadline] = useState(() => endsAt ?? new Date(Date.now() + 1000 * 60 * 60 * 48));
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const timeText = formatRemaining(remaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative inline-flex items-stretch select-none"
    >
      <div className="relative flex items-center gap-2 pl-5 pr-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold text-sm rounded-r-full shadow-lg shadow-red-600/30 before:absolute before:content-[''] before:left-0 before:top-0 before:bottom-0 before:w-4 before:-skew-x-12 before:bg-gradient-to-b before:from-red-700 before:to-red-600 before:rounded-l-md">
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center relative"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
        >
          <svg className="w-3.5 h-3.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" className="opacity-60" />
            <path d="M12 6v6l3 3" />
          </svg>
        </motion.div>
        <span className="tracking-wide">Founders Sale</span>
        <span className="font-mono bg-white/10 rounded px-2 py-0.5 text-xs tracking-tight">{timeText}</span>
      </div>
      <div className="absolute left-0 top-full h-2 w-4 -skew-x-12 bg-red-700/70 blur-sm" />
    </motion.div>
  );
}