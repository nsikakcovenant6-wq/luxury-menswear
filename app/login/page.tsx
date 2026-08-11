"use client";

import {
  useState,
  FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: LoginUser;
};

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        (await response.json()) as LoginResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.user
      ) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      /*
       * ============================================================
       * ADMIN LOGIN
       * ============================================================
       *
       * The login API verifies the user's credentials and returns
       * the user's role.
       *
       * ADMIN users go to:
       *
       * /admin/dashboard
       *
       * Normal customers go to:
       *
       * /dashboard
       * ============================================================
       */

      if (
        data.user.role?.toUpperCase() ===
        "ADMIN"
      ) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      /*
       * ============================================================
       * NORMAL CUSTOMER LOGIN
       * ============================================================
       */

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-16 text-white">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
            <ShieldCheck
              size={26}
              className="text-[#D4AF37]"
            />
          </div>

          <p className="mt-5 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
            Welcome Back
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Sign In
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Access your Benkaso Collection account.
          </p>
        </div>

        {/* ======================================================
            LOGIN FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-white/60"
            >
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition focus-within:border-[#D4AF37]/60">
              <Mail
                size={16}
                className="shrink-0 text-[#D4AF37]"
              />

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    email: e.target.value,
                  }))
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-white/60"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition focus-within:border-[#D4AF37]/60">
              <Lock
                size={16}
                className="shrink-0 text-[#D4AF37]"
              />

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    password: e.target.value,
                  }))
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={isLoading}
                className="shrink-0"
              >
                {showPassword ? (
                  <EyeOff
                    size={16}
                    className="text-white/40 transition hover:text-white"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="text-white/40 transition hover:text-white"
                  />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm leading-5 text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* FORGOT PASSWORD */}

          <div className="flex justify-end">
            <Link
              href="/contact"
              className="text-sm text-[#D4AF37] transition hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#0B0B0B] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        {/* REGISTER */}

        <p className="mt-6 text-center text-sm text-white/50">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-[#D4AF37] transition hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}