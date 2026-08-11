"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Julian Marchetti",
    role: "Creative Director, Milan",
    quote:
      "Every garment feels considered down to the stitch. This is the first label that treats restraint as luxury rather than an afterthought.",
    avatar:
      "https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t2",
    name: "Adrian Okafor",
    role: "Investment Partner, Lagos",
    quote:
      "The tailoring rivals bespoke houses at a fraction of the wait time. I've replaced three wardrobes worth of staples with Benkasa alone.",
    avatar:
      "https://images.unsplash.com/photo-1612214070442-3c806a722f0b?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t3",
    name: "Chidi Nwosu",
    role: "Groom, Port Harcourt",
    quote:
      "Understated, precise, and built to outlast trend cycles entirely. It's rare to find menswear this disciplined in its design language.",
    avatar:
      "https://images.unsplash.com/photo-1533108344127-a586d2b02479?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive((index + TESTIMONIALS.length) % TESTIMONIALS.length);
    },
    [active]
  );

  const len = TESTIMONIALS.length;
  const idx = ((active % len) + len) % len;
  const current = TESTIMONIALS[idx]!;

  return (
    <section
      aria-labelledby="testimonials-heading"
      ref={ref}
      className="relative w-full overflow-hidden bg-[#0B0B0B] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#D4AF37]/[0.06] blur-[160px]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]"
        >
          Words From Our Clientele
        </motion.span>

        <motion.h2
          id="testimonials-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-14 font-serif text-4xl leading-tight text-white sm:text-5xl"
        >
          Trusted by Discerning Gentlemen
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-12"
        >
          <Quote size={40} className="mx-auto mb-6 text-[#D4AF37]/70" aria-hidden="true" />

          <div className="relative min-h-[220px] sm:min-h-[180px]" aria-live="polite">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -40 : 40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-6"
              >
                <p className="max-w-2xl font-serif text-xl leading-relaxed text-white/90 sm:text-2xl">
                  &ldquo;{current.quote}&rdquo;
                </p>

                <div
                  className="flex items-center gap-0.5"
                  aria-label={`Rated ${current.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      aria-hidden="true"
                      className={
                        i < current.rating
                          ? "fill-[#D4AF37] text-[#D4AF37]"
                          : "fill-white/10 text-white/10"
                      }
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#D4AF37]/50">
                    <Image
                      src={current.avatar}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{current.name}</p>
                    <p className="text-xs text-white/50">{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Select testimonial">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Testimonial from ${t.name}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${
                    i === active ? "w-7 bg-[#D4AF37]" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}