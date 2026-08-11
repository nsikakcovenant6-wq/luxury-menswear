"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Scissors,
  Sparkles,
  Shirt,
  ShieldCheck,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:px-10 lg:px-16 lg:pb-28">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* TEXT */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">
              About Benkaso Collection
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              African Elegance.
              <br />
              <span className="text-[#D4AF37]">
                Modern Luxury.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/50">
              Benkaso Collection is a premium menswear brand focused on
              sophisticated African fashion, timeless craftsmanship and
              distinctive designs for the modern gentleman.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
              Every piece is created with attention to detail, quality and
              individuality — helping our customers look confident for
              important occasions and everyday moments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:border-[#D4AF37]/40 hover:bg-white/10"
              >
                Visit Our Showroom
              </Link>
            </div>
          </div>

          {/* IMAGE */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="aspect-[4/5]">
                <img
                  src="/images/about-hero.jpg"
                  alt="Benkaso Collection luxury menswear"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[#D4AF37]/20 bg-[#111]/90 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                Our Philosophy
              </p>

              <p className="mt-2 text-sm font-medium">
                Designed to make
                <br />
                an impression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STORY
      ========================================================= */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* IMAGE */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="aspect-[4/3]">
                <img
                  src="/images/about-story.jpg"
                  alt="African menswear craftsmanship"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* TEXT */}
          <div className="order-1 lg:order-2">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              Our Story
            </p>

            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              More than clothing.
              <br />
              It is a statement.
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-white/45">
              <p>
                Benkaso Collection was created around a simple idea: African
                fashion can be both deeply rooted in culture and unmistakably
                modern.
              </p>

              <p>
                We believe clothing should do more than fit. It should
                communicate confidence, personality and character.
              </p>

              <p>
                From carefully selected fabrics to refined silhouettes and
                finishing details, our approach is centred on creating
                garments that feel distinctive while remaining timeless.
              </p>

              <p>
                Whether you are dressing for a wedding, celebration, business
                event or simply want to elevate your everyday appearance,
                Benkaso Collection is designed for the modern African
                gentleman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================= */}
      <section className="px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              What We Stand For
            </p>

            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              The Benkaso Standard
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/40">
              Every part of the Benkaso experience is built around quality,
              style and attention to detail.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={<Scissors size={22} />}
              title="Craftsmanship"
              text="Attention to construction, finishing and the small details that make a garment feel special."
            />

            <ValueCard
              icon={<Sparkles size={22} />}
              title="Distinctive Style"
              text="Modern African designs created for men who want their clothing to reflect their personality."
            />

            <ValueCard
              icon={<ShieldCheck size={22} />}
              title="Quality"
              text="We believe premium fashion starts with carefully considered materials and reliable finishing."
            />

            <ValueCard
              icon={<Shirt size={22} />}
              title="Confidence"
              text="Our goal is simple: help every customer feel confident in what they wear."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          COLLECTION
      ========================================================= */}
      <section className="px-6 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              The Collection
            </p>

            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Made for memorable moments.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/45">
              Explore our collection of African-inspired menswear, tailored
              pieces and statement designs. Our collection is continually
              evolving to bring you fresh styles while maintaining the
              character and elegance that define Benkaso Collection.
            </p>

            <div className="mt-7 space-y-3">
              <Feature text="Premium African-inspired menswear" />
              <Feature text="Elegant designs for special occasions" />
              <Feature text="Modern styles for the everyday gentleman" />
              <Feature text="Personalised and refined styling" />
            </div>

            <Link
              href="/collections"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] transition hover:gap-3"
            >
              View our collection
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <div className="aspect-[4/3]">
              <img
                src="/images/about-collection.jpg"
                alt="Benkaso Collection African fashion"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SHOWROOM
      ========================================================= */}
      <section className="border-t border-white/5 px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-8 md:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-[100px]" />

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
                  Visit Us
                </p>

                <h2 className="mt-3 text-3xl font-semibold">
                  Experience Benkaso Collection in person.
                </h2>

                <div className="mt-5 flex items-start gap-3 text-sm text-white/50">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#D4AF37]"
                  />

                  <span>
                    Port Harcourt,
                    <br />
                    Rivers State, Nigeria
                  </span>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Contact Us
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-6 pb-24 pt-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
            Benkaso Collection
          </p>

          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Dress with confidence.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40">
            Discover a collection created for men who appreciate African
            culture, refined fashion and timeless style.
          </p>

          <Link
            href="/collections"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Shop the Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ================================================================
   VALUE CARD
================================================================ */

function ValueCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-[#D4AF37]/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/40">
        {text}
      </p>
    </div>
  );
}

/* ================================================================
   FEATURE
================================================================ */

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/60">
      <CheckCircle2
        size={17}
        className="shrink-0 text-[#D4AF37]"
      />

      <span>{text}</span>
    </div>
  );
}