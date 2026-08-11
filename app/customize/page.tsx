"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  stock: number;
  inStock: boolean;
};

type Customization = {
  productId: string;
  productName: string;
  fabric: string;
  color: string;
  style: string;
  lapel: string;
  fit: string;
  size: string;
  quantity: number;
  instructions: string;
};

const FABRICS = [
  "Italian Wool",
  "Cashmere",
  "Cotton",
  "Linen",
  "Silk Blend",
];

const STYLES = [
  "Single Breasted",
  "Double Breasted",
  "Tuxedo",
  "Agbada",
  "Kaftan",
];

const LAPELS = [
  "Peak",
  "Notch",
  "Shawl",
];

const FITS = [
  "Slim Fit",
  "Classic Fit",
  "Regular Fit",
];

const DEFAULT_COLORS = [
  "Black",
  "Navy",
  "Royal Blue",
  "Wine",
  "Burgundy",
  "Cream",
  "Gold",
  "Brown",
  "Grey",
  "Green",
];

const DEFAULT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CustomizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("id");

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [fabric, setFabric] =
    useState("Italian Wool");

  const [color, setColor] =
    useState("");

  const [style, setStyle] =
    useState("Single Breasted");

  const [lapel, setLapel] =
    useState("Peak");

  const [fit, setFit] =
    useState("Slim Fit");

  const [size, setSize] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [instructions, setInstructions] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError(
          "No product was selected for customization."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products/${productId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Unable to load this product."
          );
        }

        const loadedProduct =
          data.product as Product;

        setProduct(loadedProduct);

        /*
         * FIX:
         * Array[index] can be undefined under strict
         * TypeScript / noUncheckedIndexedAccess.
         *
         * Using ?? "" guarantees that the state setter
         * always receives a string.
         */
        if (
          Array.isArray(
            loadedProduct.colors
          ) &&
          loadedProduct.colors.length > 0
        ) {
          setColor(
            loadedProduct.colors[0] ?? ""
          );
        } else {
          setColor("");
        }

        if (
          Array.isArray(
            loadedProduct.sizes
          ) &&
          loadedProduct.sizes.length > 0
        ) {
          setSize(
            loadedProduct.sizes[0] ?? ""
          );
        } else {
          setSize("");
        }
      } catch (err) {
        console.error(
          "Customize product error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function saveDesign() {
    if (!product) {
      return;
    }

    const customization: Customization = {
      productId: product.id,
      productName: product.name,
      fabric,
      color,
      style,
      lapel,
      fit,
      size,
      quantity,
      instructions:
        instructions.trim(),
    };

    try {
      sessionStorage.setItem(
        "benkaso-customization",
        JSON.stringify(customization)
      );
    } catch (storageError) {
      console.error(
        "Unable to save customization:",
        storageError
      );
    }
  }

  function continueToMeasurement() {
    if (!product) {
      return;
    }

    if (
      product.sizes?.length &&
      !size
    ) {
      setError(
        "Please select a size before continuing."
      );
      return;
    }

    if (
      product.colors?.length &&
      !color
    ) {
      setError(
        "Please select a colour before continuing."
      );
      return;
    }

    if (
      product.stock <= 0 ||
      !product.inStock
    ) {
      setError(
        "This product is currently out of stock."
      );
      return;
    }

    if (quantity > product.stock) {
      setError(
        "The selected quantity is greater than the available stock."
      );
      return;
    }

    setError("");
    setSaving(true);

    saveDesign();

    router.push(
      `/customize/measurement?productId=${encodeURIComponent(
        product.id
      )}`
    );
  }

  function increaseQuantity() {
    if (!product) {
      return;
    }

    if (
      quantity >= product.stock
    ) {
      return;
    }

    setQuantity(
      (current) => current + 1
    );
  }

  function decreaseQuantity() {
    setQuantity(
      (current) =>
        Math.max(1, current - 1)
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-yellow-500" />

          <p className="mt-4 text-sm text-white/40">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#111] p-8 text-center">
          <h1 className="text-2xl font-bold">
            Unable to customize product
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/50">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-6 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const previewImage =
    product.images?.[0] ??
    "/products/suit1.jpg";

  const availableColors =
    product.colors?.length
      ? product.colors
      : DEFAULT_COLORS;

  const availableSizes =
    product.sizes?.length
      ? product.sizes
      : DEFAULT_SIZES;

  return (
    <main className="min-h-screen bg-[#080808] pt-28 pb-20 text-white">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}

        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
            Benkaso Collection
          </p>

          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Customize Your{" "}
            {product.name}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Personalize your selected
            product before placing your
            order.
          </p>
        </div>

        {/* PRODUCT INFORMATION */}

        <div className="mb-8 rounded-2xl border border-yellow-700/20 bg-[#111111] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-yellow-500">
                Selected Product
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {product.name}
              </h2>

              <p className="mt-1 text-sm text-white/40">
                {product.category}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-white/30">
                Price
              </p>

              <p className="mt-1 text-xl font-bold text-yellow-500">
                {formatPrice(
                  product.price
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-2">

          {/* LEFT - CUSTOMIZATION */}

          <div className="rounded-3xl border border-yellow-700/30 bg-[#111111] p-8">
            <div className="space-y-7">

              {/* STYLE */}

              <div>
                <label
                  htmlFor="style"
                  className="font-semibold text-yellow-400"
                >
                  Style
                </label>

                <select
                  id="style"
                  value={style}
                  onChange={(e) =>
                    setStyle(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {STYLES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* FABRIC */}

              <div>
                <label
                  htmlFor="fabric"
                  className="font-semibold text-yellow-400"
                >
                  Fabric
                </label>

                <select
                  id="fabric"
                  value={fabric}
                  onChange={(e) =>
                    setFabric(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {FABRICS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* COLOUR */}

              <div>
                <label
                  htmlFor="color"
                  className="font-semibold text-yellow-400"
                >
                  Colour
                </label>

                <select
                  id="color"
                  value={color}
                  onChange={(e) =>
                    setColor(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {!color && (
                    <option value="">
                      Select a colour
                    </option>
                  )}

                  {availableColors.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SIZE */}

              <div>
                <label
                  htmlFor="size"
                  className="font-semibold text-yellow-400"
                >
                  Size
                </label>

                <select
                  id="size"
                  value={size}
                  onChange={(e) =>
                    setSize(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {!size && (
                    <option value="">
                      Select a size
                    </option>
                  )}

                  {availableSizes.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* LAPEL */}

              <div>
                <label
                  htmlFor="lapel"
                  className="font-semibold text-yellow-400"
                >
                  Lapel
                </label>

                <select
                  id="lapel"
                  value={lapel}
                  onChange={(e) =>
                    setLapel(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {LAPELS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* FIT */}

              <div>
                <label
                  htmlFor="fit"
                  className="font-semibold text-yellow-400"
                >
                  Fit
                </label>

                <select
                  id="fit"
                  value={fit}
                  onChange={(e) =>
                    setFit(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none focus:border-yellow-500"
                >
                  {FITS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* QUANTITY */}

              <div>
                <label className="font-semibold text-yellow-400">
                  Quantity
                </label>

                <div className="mt-2 flex w-fit items-center overflow-hidden rounded-xl border border-gray-700 bg-black">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    aria-label="Decrease quantity"
                    className="px-5 py-3 text-lg text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    −
                  </button>

                  <span className="min-w-12 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      product.stock <=
                      quantity
                    }
                    aria-label="Increase quantity"
                    className="px-5 py-3 text-lg text-white/60 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <p className="mt-2 text-xs text-white/30">
                  {product.stock} available
                </p>
              </div>

              {/* SPECIAL INSTRUCTIONS */}

              <div>
                <label
                  htmlFor="instructions"
                  className="font-semibold text-yellow-400"
                >
                  Special Instructions
                </label>

                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Tell us about any special requests..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-700 bg-black p-3 text-sm outline-none placeholder:text-white/20 focus:border-yellow-500"
                />
              </div>

              {/* SAVE */}

              <button
                type="button"
                onClick={saveDesign}
                className="w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 py-4 font-bold text-yellow-400 transition hover:bg-yellow-500/20"
              >
                Save Design
              </button>
            </div>
          </div>

          {/* RIGHT - PREVIEW */}

          <div className="rounded-3xl border border-yellow-700/30 bg-[#111111] p-8">

            <h2 className="mb-6 text-3xl font-bold">
              Live Preview
            </h2>

            <div className="overflow-hidden rounded-2xl bg-black">
              <div className="relative aspect-[4/5] w-full">

                <Image
                  src={previewImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 pt-20">
                  <p className="text-xs uppercase tracking-widest text-yellow-400">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {product.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* CUSTOMIZATION SUMMARY */}

            <div className="mt-8 space-y-4">

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Style
                </span>

                <span>
                  {style}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Fabric
                </span>

                <span>
                  {fabric}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Colour
                </span>

                <span>
                  {color ||
                    "Not selected"}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Size
                </span>

                <span>
                  {size ||
                    "Not selected"}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Lapel
                </span>

                <span>
                  {lapel}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Fit
                </span>

                <span>
                  {fit}
                </span>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">
                  Quantity
                </span>

                <span>
                  {quantity}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-gray-400">
                  Total
                </span>

                <span className="text-xl font-bold text-yellow-500">
                  {formatPrice(
                    product.price *
                      quantity
                  )}
                </span>
              </div>
            </div>

            {/* CONTINUE */}

            <button
              type="button"
              onClick={
                continueToMeasurement
              }
              disabled={
                saving ||
                !product.inStock ||
                product.stock <= 0
              }
              className="mt-10 w-full rounded-xl bg-yellow-500 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!product.inStock ||
              product.stock <= 0
                ? "Out of Stock"
                : saving
                ? "Saving..."
                : "Continue to Measurement"}
            </button>

            <p className="mt-3 text-center text-xs text-white/25">
              Your customization will be
              saved before proceeding.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}