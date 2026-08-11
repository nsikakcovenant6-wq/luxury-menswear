import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { NAV_LINKS, SITE_NAME, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold tracking-[0.3em]">
            BENKASO<span className="text-[#D4AF37]">.</span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-white/50">
            Premium bespoke tailoring — suits, agbada, senator wear, and custom
            outfits crafted for distinction.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${SITE_NAME} on Instagram`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <span className="text-sm font-bold">IG</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${SITE_NAME} on Facebook`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <span className="text-sm font-bold">FB</span>
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">Navigate</p>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/50 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">Account</p>
          <ul className="mt-4 space-y-3">
            <li><Link href="/login" className="text-sm text-white/50 hover:text-white">Login</Link></li>
            <li><Link href="/register" className="text-sm text-white/50 hover:text-white">Register</Link></li>
            <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white">My Dashboard</Link></li>
            <li><Link href="/tracking" className="text-sm text-white/50 hover:text-white">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-white/50">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#D4AF37]" />
              {CONTACT_ADDRESS}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-[#D4AF37]" />
              {CONTACT_PHONE}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-[#D4AF37]" />
              {CONTACT_EMAIL}
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}