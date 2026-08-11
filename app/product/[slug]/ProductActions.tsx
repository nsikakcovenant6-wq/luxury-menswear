"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
    colors: string[];
    sizes: string[];
  };
  disabled: boolean;
};

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] =
    useState("");
  const [selectedSize, setSelectedSize] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function addToCart() {
    if (disabled || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: selectedColor || null,
          size: selectedSize || null,
        }),
      });

      let data: {
        success?: boolean;
        message?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to add product to cart (${response.status}).`
        );
      }

      setMessage(
        data.message || "Product added to your cart."
      );

      setTimeout(() => {
        router.push("/cart");
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Add to cart error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add product to cart."
      );
    } finally {
      setLoading(false);
    }
  }

  function buyNow() {
    if (disabled || loading) return;

    const params = new URLSearchParams();

    params.set("product", product.id);
    params.set("quantity", String(quantity));

    if (selectedColor) {
      params.set("color", selectedColor);
    }

    if (selectedSize) {
      params.set("size", selectedSize);
    }

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="mt-8 space-y-6">
      {/* COLORS */}
      {product.colors.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/50">
            Color
          </p>

          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`rounded-lg border px-4 py-2 text-xs capitalize transition ${
                  selectedColor === color
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SIZES */}
      {product.sizes.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/50">
            Size
          </p>

          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-lg border px-4 py-2 text-xs transition ${
                  selectedSize === size
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUANTITY */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/50">
          Quantity
        </p>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() =>
              setQuantity((current) =>
                Math.max(1, current - 1)
              )
            }
            className="px-4 py-3 text-white/60 hover:bg-white/5 disabled:opacity-30"
          >
            −
          </button>

          <span className="min-w-12 text-center text-sm">
            {quantity}
          </span>

          <button
            type="button"
            disabled={quantity >= product.stock}
            onClick={() =>
              setQuantity((current) =>
                Math.min(product.stock, current + 1)
              )
            }
            className="px-4 py-3 text-white/60 hover:bg-white/5 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
          {message}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={addToCart}
          className="rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Adding..."
            : disabled
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={buyNow}
          className="rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>

      {/* CUSTOMIZE */}
      <button
        type="button"
        onClick={() =>
          router.push(
            `/customize?product=${encodeURIComponent(
              product.slug
            )}`
          )
        }
        className="w-full rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white/70 transition hover:border-[#D4AF37]/40 hover:text-white"
      >
        Customize This Piece
      </button>
    </div>
  );
}