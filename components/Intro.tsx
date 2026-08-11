"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface IntroProps {
  children: React.ReactNode;
}

export default function Intro({ children }: IntroProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const hasVisited = sessionStorage.getItem("visited");

    if (hasVisited) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem("visited", "true");
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.h1
                className="text-6xl font-bold text-yellow-400"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                LUXE THREADS
              </motion.h1>

              <motion.p
                className="mt-4 text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Preparing Luxury Experience...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && children}
    </>
  );
}