"use client";

import { ShieldCheck, Tag } from "lucide-react";

export interface SummaryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CheckoutSummaryProps {
  items: SummaryItem[];
  shipping?: number;
  discount?: number;
}

export default function CheckoutSummary({
  items,
  shipping = 5000,
  discount = 0,
}: CheckoutSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shipping - discount;

  return (
    <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">Order Summary</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-white/70">
            <span className="truncate pr-2">
              {item.name} <span className="text-white/40">× {item.quantity}</span>
            </span>
            <span className="flex-shrink-0 text-white">
              ₦{(item.price * item.quantity).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between text-white/60">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-white/60">
          <span>Shipping</span>
          <span>₦{shipping.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-[#D4AF37]">
            <span className="flex items-center gap-1">
              <Tag size={14} /> Discount
            </span>
            <span>-₦{discount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
        <span>Total</span>
        <span>₦{total.toLocaleString()}</span>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-white/40">
        <ShieldCheck size={14} className="text-[#D4AF37]" />
        Secure checkout · Encrypted payment
      </p>
    </div>
  );
}