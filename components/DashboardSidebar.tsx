"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  User,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard?tab=orders", icon: Package },
  { label: "Profile", href: "/dashboard?tab=profile", icon: User },
  { label: "Wishlist", href: "/dashboard?tab=wishlist", icon: Heart },
  { label: "Settings", href: "/dashboard?tab=settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:w-64">
      <nav aria-label="Dashboard navigation">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href.split("?")[0];
            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "bg-[#D4AF37] text-[#0B0B0B] font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-red-400"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </aside>
  );
}
