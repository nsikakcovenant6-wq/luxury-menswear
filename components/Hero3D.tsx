"use client";

import { motion } from "framer-motion";

export default function Hero3D() {
  return (
    <div className="relative flex h-[620px] items-center justify-center overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#0b0b0b] via-[#111111] to-[#1a1a1a]">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" />

      {/* Floating Gold Circles */}
      <motion.div
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute left-8 top-16 h-24 w-24 rounded-full bg-[#D4AF37]/20 blur-xl"
      />

      <motion.div
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-20 right-10 h-36 w-36 rounded-full bg-yellow-500/10 blur-2xl"
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: .8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .8 }}
        className="relative w-[360px]"
      >

        {/* Suit Card */}
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="rounded-[30px] border border-[#D4AF37]/30 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(212,175,55,0.15)]"
        >

          <div className="flex flex-col items-center">

            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-black text-5xl">
              🤵🏿
            </div>

            <h2 className="text-3xl font-bold text-white">
              Bespoke Luxury
            </h2>

            <p className="mt-4 text-center text-white/60">
              Every Benkaso outfit is handcrafted,
              measured to perfection,
              and tailored for elegance.
            </p>

            <div className="mt-8 grid w-full grid-cols-2 gap-4">

              <div className="rounded-xl border border-[#D4AF37]/20 bg-black/40 p-4 text-center">
                <p className="text-2xl font-bold text-[#D4AF37]">
                  100%
                </p>
                <p className="text-xs text-white/60">
                  Handmade
                </p>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/20 bg-black/40 p-4 text-center">
                <p className="text-2xl font-bold text-[#D4AF37]">
                  48h
                </p>
                <p className="text-xs text-white/60">
                  Consultation
                </p>
              </div>

            </div>

          </div>

        </motion.div>

      </motion.div>

      {/* Floating Cards */}

      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute left-6 bottom-16 rounded-xl border border-[#D4AF37]/20 bg-black/60 p-4 backdrop-blur-xl"
      >
        <p className="text-xs text-white/50">
          Premium Fabric
        </p>

        <p className="font-semibold text-[#D4AF37]">
          Italian Wool
        </p>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute right-6 top-20 rounded-xl border border-[#D4AF37]/20 bg-black/60 p-4 backdrop-blur-xl"
      >
        <p className="text-xs text-white/50">
          Tailoring
        </p>

        <p className="font-semibold text-[#D4AF37]">
          Perfect Fit
        </p>
      </motion.div>

    </div>
  );
}