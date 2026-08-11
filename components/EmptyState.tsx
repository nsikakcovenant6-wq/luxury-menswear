"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-xl">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10">
        <Icon size={28} className="text-[#D4AF37]" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-white/50">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}