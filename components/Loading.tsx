"use client";

import { motion } from "framer-motion";

interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export default function Loading({ label = "Loading", fullScreen = true }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen w-full bg-[#0B0B0B]" : "py-16"
      }`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]"
      />
      <p className="text-sm uppercase tracking-widest text-white/50">{label}</p>
      <span className="sr-only">Content is loading</span>
    </div>
  );
}