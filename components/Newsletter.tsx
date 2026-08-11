"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative w-full overflow-hidden bg-[#0B0B0B] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#D4AF37_1px,transparent_1px),linear-gradient(90deg,#D4AF37_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_8px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-14"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10">
          <Mail size={22} className="text-[#D4AF37]" aria-hidden="true" />
        </div>

        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          The Inner Circle
        </span>

        <h2
          id="newsletter-heading"
          className="mb-4 font-serif text-3xl leading-tight text-white sm:text-4xl"
        >
          Private Access to New Arrivals
        </h2>

        <p className="mx-auto mb-9 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          Join the Benkasa private list for early access to limited releases, seasonal
          edits, and invitations to house events, before they reach the public.
        </p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              role="status"
              className="flex flex-col items-center gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-6"
            >
              <CheckCircle2 size={28} className="text-[#D4AF37]" />
              <p className="text-sm font-medium text-white">
                Welcome to the circle. Confirmation sent to your inbox.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? "newsletter-error" : undefined}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-5 py-3.5 text-sm text-white placeholder:text-white/30 transition-colors duration-300 focus:border-[#D4AF37] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="group flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#0B0B0B] transition-all duration-300 hover:bg-[#e2c14f] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div aria-live="polite" className="mt-3 min-h-[20px]">
          {status === "error" && (
            <p id="newsletter-error" className="text-xs font-medium text-red-400">
              {errorMessage}
            </p>
          )}
        </div>

        <p className="mt-6 text-[11px] text-white/30">
          No spam. Unsubscribe anytime. Read our{" "}
          <Link
            href="/privacy"
            className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-[#D4AF37]"
          >
            privacy policy
          </Link>
          .
        </p>
      </motion.div>
    </section>
  );
}