"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

export type CartLineItem = {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  stock: number;
};

type CartItemProps = {
  item: CartLineItem;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  updating?: boolean;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  updating = false,
}: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex gap-4">
        {/* IMAGE */}
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-36 sm:w-28">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              unoptimized
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
              No image
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">
                {item.category}
              </p>

              <h2 className="mt-1 truncate text-base font-medium text-white sm:text-lg">
                {item.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={updating}
              aria-label={`Remove ${item.name}`}
              className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* VARIANTS */}
          {(item.size || item.color) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.size && (
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50">
                  Size: {item.size}
                </span>
              )}

              {item.color && (
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50">
                  {item.color}
                </span>
              )}
            </div>
          )}

          <p className="mt-3 text-sm font-semibold text-[#D4AF37]">
            {formatPrice(item.price)}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
            {/* QUANTITY */}
            <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <button
                type="button"
                disabled={updating || item.quantity <= 1}
                onClick={() => onDecrease(item.id)}
                className="p-2.5 text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
              >
                <Minus size={13} />
              </button>

              <span className="min-w-8 text-center text-xs">
                {item.quantity}
              </span>

              <button
                type="button"
                disabled={
                  updating ||
                  item.quantity >= item.stock
                }
                onClick={() => onIncrease(item.id)}
                className="p-2.5 text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* SUBTOTAL */}
            <p className="text-sm font-semibold text-white">
              {formatPrice(subtotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}