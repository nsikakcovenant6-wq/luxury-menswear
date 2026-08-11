"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";

interface ShowroomLook {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  image: string;
}

const LOOKS: ShowroomLook[] = [
  {
    id: "s1",
    slug: "the-signature-senator",
    title: "The Signature Senator",
    location: "Lagos Atelier",
    description:
      "Cut from premium cotton with a structured stand collar, finished by hand for a clean, modern silhouette.",
    image:
      "https://images.unsplash.com/photo-1620932934088-fbdb2920e484?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "s2",
    slug: "the-classic-shirt-trouser",
    title: "The Classic Shirt & Trouser",
    location: "Abuja Atelier",
    description:
      "Crisp poplin shirting paired with tapered trousers, built for the room where first impressions decide everything.",
    image:
      "https://images.unsplash.com/photo-1546525848-3ce03ca516f6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "s3",
    slug: "the-groom-wedding-suit",
    title: "The Groom's Wedding Suit",
    location: "Port Harcourt Atelier",
    description:
      "A three-piece silhouette weighted to fall exactly right, tailored for the biggest day on the calendar.",
    image:
      "https://images.unsplash.com/photo-1533108344127-a586d2b02479?q=80&w=1600&auto=format&fit=crop",
  },
];

function ShowroomRow({ look, index }: { look: ShowroomLook; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reversed ? "" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: reversed ? 60 : -60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${
          reversed ? "lg:order-2" : ""
        }`}
      >
        <Image
          src={look.image}
          alt={look.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/70 via-transparent to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-[#D4AF37]/20"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reversed ? -60 : 60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-col gap-5 ${reversed ? "lg:order-1" : ""}`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
          <MapPin size={14} aria-hidden="true" />
          {look.location}
        </div>

        <h3 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
          {look.title}
        </h3>

        <p className="max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          {look.description}
        </p>

        <Link
          href={`/showroom/${look.slug}`}
          className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
        >
          Explore the Look
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </motion.div>
    </div>
  );
}

export default function Showroom() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });

  return (
    <section
      aria-labelledby="showroom-heading"
      className="relative w-full overflow-hidden bg-[#0B0B0B] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-1/4 h-[550px] w-[550px] rounded-full bg-[#D4AF37]/[0.05] blur-[160px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div ref={headingRef} className="mb-20 max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]"
          >
            The Showroom
          </motion.span>
          <motion.h2
            id="showroom-heading"
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl leading-tight text-white sm:text-5xl"
          >
            Step Inside the Atelier
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-sm leading-relaxed text-white/60 sm:text-base"
          >
            A closer look at the pieces defining this season, photographed in
            the ateliers where each was cut, fitted, and finished by hand.
          </motion.p>
        </div>

        <div className="flex flex-col gap-24" aria-label="Showroom looks">
          {LOOKS.map((look, index) => (
            <ShowroomRow key={look.id} look={look} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}