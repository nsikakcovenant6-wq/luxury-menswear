"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Compass size={40} className="mx-auto mb-6 text-[#D4AF37]" />
        <h1 className="text-7xl font-bold text-white">404</h1>
        <p className="mt-4 text-lg text-white/60">
          This page doesn&apos;t exist in the Benkasa Collection.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}