"use client";

import { motion } from "framer-motion";
import { Package, Wallet, Heart, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
}

const stats: Stat[] = [
  { label: "Total Orders", value: "12", icon: Package },
  { label: "Total Spent", value: "₦482,000", icon: Wallet },
  { label: "Wishlist Items", value: "6", icon: Heart },
  { label: "Pending Orders", value: "2", icon: Clock },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">{stat.label}</span>
            <stat.icon size={18} className="text-[#D4AF37]" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}