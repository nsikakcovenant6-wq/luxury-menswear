"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create your account."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-16 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
            Join Benkasa
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Create Account
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm text-white/60"
            >
              Full Name
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-[#D4AF37]/60">
              <User
                size={16}
                className="text-[#D4AF37]"
              />

              <input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-white/60"
            >
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-[#D4AF37]/60">
              <Mail
                size={16}
                className="text-[#D4AF37]"
              />

              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-white/60"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-[#D4AF37]/60">
              <Lock
                size={16}
                className="text-[#D4AF37]"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={16}
                    className="text-white/40"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="text-white/40"
                  />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm text-white/60"
            >
              Confirm Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-[#D4AF37]/60">
              <Lock
                size={16}
                className="text-[#D4AF37]"
              />

              <input
                id="confirmPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      e.target.value,
                  })
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isLoading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#D4AF37] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}