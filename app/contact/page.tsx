"use client";

import { useState, FormEvent } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Get In Touch</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Contact Benkasa Collection</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            Questions about a custom Senator wear, Agbada, or wedding suit order? Reach out — our
            team responds within 24 hours.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {[
              { icon: Phone, label: "Phone", value: "+234 802 345 6789" },
              { icon: Mail, label: "Email", value: "hello@benkasacollection.com" },
              { icon: MapPin, label: "Showroom", value: "14 Adeola Odeku Street, Victoria Island, Lagos" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10">
                  <Icon size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm text-white/50">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:col-span-3"
          >
            {submitted ? (
              <div className="py-12 text-center">
                <p className="text-lg font-semibold text-[#D4AF37]">Message sent!</p>
                <p className="mt-2 text-sm text-white/50">We&apos;ll get back to you shortly.</p>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm text-white/60">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/60"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm text-white/60">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/60"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm text-white/60">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/60"
                    placeholder="Tell us what you're looking for..."
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </main>
  );
}