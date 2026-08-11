"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const CONTACT = {
  phone: "902 360 0236",
  showroom: "Port Harcourt, Rivers State, Nigeria",
  email: "admin@benkasocollection.com",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden px-6 pb-16 pt-28 md:px-10 lg:px-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mt-12 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">
              Contact Benkaso Collection
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Let&apos;s talk
              <br />
              <span className="text-[#D4AF37]">
                about your style.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Whether you want to ask about a product, visit our showroom,
              discuss an order or simply learn more about Benkaso Collection,
              we&apos;d be happy to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT CARDS
      ========================================================= */}
      <section className="px-6 py-10 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* PHONE */}
          <ContactCard
            icon={<Phone size={22} />}
            title="Call Us"
            label="Phone"
            value={CONTACT.phone}
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
          />

          {/* WHATSAPP */}
          <ContactCard
            icon={<MessageCircle size={22} />}
            title="WhatsApp"
            label="Chat with us"
            value="Send us a message"
            href="#whatsapp"
          />

          {/* EMAIL */}
          <ContactCard
            icon={<Mail size={22} />}
            title="Email"
            label="Email"
            value={CONTACT.email}
            href={`mailto:${CONTACT.email}`}
          />
        </div>
      </section>

      {/* =========================================================
          SHOWROOM
      ========================================================= */}
      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          {/* DETAILS */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              Our Showroom
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              Visit Benkaso Collection
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/40">
              Come and experience our collection in person. Our showroom is
              located in Port Harcourt, Rivers State, Nigeria.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <MapPin size={20} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Port Harcourt,
                    <br />
                    Rivers State, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Clock3 size={20} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Showroom
                  </p>

                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Please contact us before visiting so we can assist you
                    properly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Phone size={20} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/30">
                    Phone
                  </p>

                  <a
                    href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                    className="mt-1 block text-sm text-white/70 transition hover:text-[#D4AF37]"
                  >
                    {CONTACT.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
              >
                <Phone size={16} />
                Call Us
              </a>

              <a
                href="#whatsapp"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:border-[#D4AF37]/40 hover:bg-white/10"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* MAP / LOCATION PLACEHOLDER */}
          <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_55%)]" />

            <div className="relative flex h-full min-h-[400px] flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                <MapPin
                  size={28}
                  className="text-[#D4AF37]"
                />
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Benkaso Collection
              </p>

              <h3 className="mt-3 text-2xl font-semibold">
                Port Harcourt
              </h3>

              <p className="mt-2 text-sm text-white/40">
                Rivers State, Nigeria
              </p>

              <p className="mt-6 max-w-sm text-xs leading-6 text-white/25">
                Contact us for the exact showroom directions and assistance
                before your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK HELP
      ========================================================= */}
      <section className="px-6 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-8 text-center md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              Need Help?
            </p>

            <h2 className="mt-4 text-3xl font-semibold">
              We&apos;re here to help.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40">
              Have questions about sizing, availability, orders or our
              collection? Contact Benkaso Collection and our team will assist
              you.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-black transition hover:opacity-90"
              >
                <Phone size={16} />
                {CONTACT.phone}
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <Mail size={16} />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER CTA
      ========================================================= */}
      <section className="border-t border-white/5 px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Benkaso Collection
          </p>

          <h2 className="mt-3 text-2xl font-semibold">
            Ready to discover your next look?
          </h2>

          <Link
            href="/collections"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] transition hover:gap-3"
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
   CONTACT CARD
================================================================ */

function ContactCard({
  icon,
  title,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  label: string;
  value: string;
  href: string;
}) {
  const isAnchor = href.startsWith("#");

  const content = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
        {icon}
      </div>

      <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <h3 className="mt-2 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 break-words text-sm text-white/50">
        {value}
      </p>
    </>
  );

  if (isAnchor) {
    return (
      <a
        href={href}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:bg-white/[0.05]"
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:bg-white/[0.05]"
    >
      {content}
    </a>
  );
}