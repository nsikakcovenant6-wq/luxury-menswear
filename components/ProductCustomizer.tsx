"use client";

import { useState } from "react";
import { ShoppingBag, Loader2, Check, Minus, Plus } from "lucide-react";
import { useAddToCart } from "@/lib/useAddToCart";

/* =========================================================================
   TYPES
========================================================================= */

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductCustomizerProps {
  product: Product;
  /** Available fabric colors for this piece, e.g. ["Black", "Ivory", "Gold"] */
  colors?: string[];
  /** Whether this product requires the customer's saved body measurements */
  requiresMeasurements?: boolean;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

/* =========================================================================
   COMPONENT
========================================================================= */

export default function ProductCustomizer({
  product,
  colors = [],
  requiresMeasurements = true,
}: ProductCustomizerProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null
  );
  const [measurementsConfirmed, setMeasurementsConfirmed] = useState(false);

  const { addToCart, isLoading, isAdded } = useAddToCart();

  const loading = isLoading(product.id);
  const added = isAdded(product.id);
  const outOfStock = product.stock <= 0;

  // If this product has color options, a color must be selected before
  // it can be added to cart.
  const colorRequired = colors.length > 0;
  const colorSelected = !colorRequired || Boolean(selectedColor);

  const canAddToCart =
    !outOfStock &&
    !loading &&
    !added &&
    colorSelected &&
    (!requiresMeasurements || measurementsConfirmed);

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(product.stock || 99, q + 1));

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart(product.id, quantity);
  };

  return (
    <div className="rounded-2xl border border-[#D4AF37]/15 bg-white/[0.03] p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
      <p className="mt-1 text-lg font-medium text-[#D4AF37]">
        {formatCurrency(product.price)}
      </p>

      {colors.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-pressed={selectedColor === color}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  selectedColor === color
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "border-white/15 text-white/60 hover:border-white/30"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
          Quantity
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decreaseQty}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm text-white" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increaseQty}
            disabled={quantity >= (product.stock || 99)}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {requiresMeasurements && (
        <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={measurementsConfirmed}
            onChange={(e) => setMeasurementsConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
          />
          I confirm my saved body measurements are up to date for this
          bespoke piece.
        </label>
      )}

      {outOfStock && (
        <p className="mt-4 text-xs text-red-300">
          This item is currently out of stock.
        </p>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        aria-busy={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#e0bd4f] px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : added ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        )}
        {loading
          ? "Adding…"
          : added
          ? "Added to Cart"
          : outOfStock
          ? "Out of Stock"
          : "Add to Cart"}
      </button>

      {colorRequired && !selectedColor && !outOfStock && (
        <p className="mt-2 text-center text-[11px] text-white/30">
          Select a color to continue
        </p>
      )}

      {requiresMeasurements && !measurementsConfirmed && !outOfStock && colorSelected && (
        <p className="mt-2 text-center text-[11px] text-white/30">
          Confirm your measurements above to continue
        </p>
      )}
    </div>
  );
}