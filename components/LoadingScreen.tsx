"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#090909] overflow-hidden">
      {/* Gold Glow */}
      <div className="absolute h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

      <div className="relative flex flex-col items-center">

        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className="text-5xl font-bold tracking-[0.35em] text-white"
        >
          BENKASO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
          }}
          className="mt-4 uppercase tracking-[0.45em] text-[#D4AF37]"
        >
          Collection
        </motion.p>

        {/* Loader */}
        <div className="mt-14 h-[3px] w-60 overflow-hidden rounded-full bg-white/10">

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="h-full w-24 rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{
            delay: 1,
            duration: 1,
          }}
          className="mt-8 text-xs uppercase tracking-[0.4em] text-white"
        >
          Crafting Luxury Experience...
        </motion.p>

      </div>
    </div>
  );
}