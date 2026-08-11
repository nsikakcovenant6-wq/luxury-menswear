"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      {/* Gold glow */}
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />

      {/* Floating gold circles */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute left-20 top-24 h-3 w-3 rounded-full bg-[#D4AF37]"
      />

      <motion.div
        animate={{
          y: [20, -25, 20],
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute right-24 bottom-40 h-4 w-4 rounded-full bg-[#D4AF37]"
      />

      <div className="flex h-screen flex-col items-center justify-center">

        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{
            opacity: 1,
            letterSpacing: "0.45em",
          }}
          transition={{
            duration: 1.2,
          }}
          className="text-5xl font-bold text-white"
        >
          BENKASO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{
            delay: 0.5,
            duration: 1,
          }}
          className="mt-3 uppercase tracking-[0.5em] text-[#D4AF37]"
        >
          COLLECTION
        </motion.p>

        <div className="mt-12 h-[2px] w-64 overflow-hidden rounded-full bg-white/10">

          <motion.div
            animate={{
              x: ["-100%", "220%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="h-full w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          />

        </div>

        <motion.p
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="mt-8 text-xs uppercase tracking-[0.45em] text-white/70"
        >
          Crafting Luxury...
        </motion.p>

      </div>
    </div>
  );
}