"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  User,
} from "lucide-react";

import {
  NAV_LINKS,
  SITE_NAME,
} from "@/lib/constants";

import { useCart } from "@/components/CartContext";

export default function Navbar() {
  const pathname = usePathname();

  const { itemCount, openDrawer } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "backdrop-blur-xl bg-black/70 border-b border-[#D4AF37]/20 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <Link
            href="/"
            className="text-xl font-bold tracking-[0.35em] text-white"
          >
            BENKASO
            <span className="text-[#D4AF37]">.</span>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden lg:flex items-center gap-10">

            {NAV_LINKS.map((link) => {

              const active = pathname === link.href;

              return (

                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm uppercase tracking-[0.25em] transition-colors duration-300 ${
                    active
                      ? "text-[#D4AF37]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}

                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute -bottom-2 left-0 h-[2px] w-full bg-[#D4AF37]"
                    />
                  )}
                </Link>

              );

            })}

          </nav>

          {/* Right Side */}

          <div className="flex items-center gap-5">

            <button
              className="hidden md:block text-white/70 hover:text-[#D4AF37] transition"
            >
              <Search size={20} />
            </button>

            <Link
              href="/login"
              className="hidden md:block text-white/70 hover:text-[#D4AF37] transition"
            >
              <User size={20} />
            </Link>

            <button
              onClick={openDrawer}
              className="relative text-white hover:text-[#D4AF37] transition"
            >
              <ShoppingBag size={22} />

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-black">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>

          </div>

        </div>
        <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden border-t border-[#D4AF37]/20 bg-black/95 backdrop-blur-xl lg:hidden"
              >
                <nav className="flex flex-col px-6 py-6">

                  {NAV_LINKS.map((link) => {

                    const active = pathname === link.href;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`border-b border-white/5 py-4 text-sm uppercase tracking-[0.25em] transition ${
                          active
                            ? "text-[#D4AF37]"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );

                  })}

                  <Link
                    href="/login"
                    className="py-4 text-sm uppercase tracking-[0.25em] text-white/70 hover:text-[#D4AF37]"
                  >
                    My Account
                  </Link>

                </nav>
              </motion.div>
            )}
          </AnimatePresence>

      </motion.header>
    </>
  );
}