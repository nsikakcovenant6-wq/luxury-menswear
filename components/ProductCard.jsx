"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product, onAddToCart }) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[#D4AF37]/40"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0B0B0B]">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <Image
            src={product.image}
            alt={`${product.name} - ${product.category} African wear`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0B0B0B]">
            New
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsFavorited((prev) => !prev)}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorited}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <Heart
            size={18}
            className={isFavorited ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"}
          />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-sm font-medium uppercase tracking-widest text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-widest text-[#D4AF37]">{product.category}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="truncate text-base font-medium text-white hover:text-[#D4AF37]">
            {product.name}
          </h3>
        </Link>

        {product.rating !== undefined && (
          <div className="flex items-center gap-1 text-sm text-white/60">
            <Star size={14} className="fill-[#D4AF37] text-[#D4AF37]" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-white">
            ₦{product.price.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/50 text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}