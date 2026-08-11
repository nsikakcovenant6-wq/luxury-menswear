"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;

  image?: string;
  images?: string[];
  imagesJson?: string;

  price: number;
  compareAtPrice?: number | null;

  stock: number;

  rating?: number;
  reviewCount?: number;

  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;

  colors?: string[];
  sizes?: string[];

  colorsJson?: string;
  sizesJson?: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

/**
 * Safely converts JSON array fields into real arrays.
 *
 * Handles:
 * ["Black","White"]
 * "[\"Black\",\"White\"]"
 * []
 * undefined
 * null
 */
function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  } catch {
    return [];
  }
}

/**
 * Converts whatever the API/database gives us
 * into one consistent Product object.
 */
function normalizeProduct(product: Product): Product {
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(
          (image) =>
            typeof image === "string" && image.trim().length > 0
        )
      : parseArray(product.imagesJson);

  const colors =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : parseArray(product.colorsJson);

  const sizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : parseArray(product.sizesJson);

  const finalImages =
    images.length > 0
      ? images
      : product.image
      ? [product.image]
      : [];

  return {
    ...product,

    name: product.name || "Untitled Product",
    category: product.category || "Uncategorized",
    description: product.description || "",

    images: finalImages,

    image: finalImages[0] || "",

    colors,
    sizes,

    price: Number(product.price || 0),

    compareAtPrice:
      product.compareAtPrice !== null &&
      product.compareAtPrice !== undefined
        ? Number(product.compareAtPrice)
        : null,

    stock: Number(product.stock || 0),

    inStock:
      product.inStock === true && Number(product.stock || 0) > 0,
  };
}

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");

  const [search, setSearch] = useState("");

  /**
   * LOAD PRODUCTS DIRECTLY FROM DATABASE API
   */
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",

          next: {
            revalidate: 0,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Products request failed: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("COLLECTIONS API RESPONSE:", data);

        /**
         * API currently returns:
         *
         * {
         *   success: true,
         *   products: [...]
         * }
         */
        const rawProducts = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
          ? data.data
          : [];

        console.log(
          "COLLECTIONS RAW PRODUCTS:",
          rawProducts
        );

        const normalizedProducts = rawProducts
          .filter(
            (product: unknown) =>
              product &&
              typeof product === "object"
          )
          .map((product: Product) =>
            normalizeProduct(product)
          );

        console.log(
          "COLLECTIONS NORMALIZED PRODUCTS:",
          normalizedProducts
        );

        if (mounted) {
          setProducts(normalizedProducts);
        }
      } catch (error) {
        console.error(
          "Collections product loading error:",
          error
        );

        if (mounted) {
          setProducts([]);

          setError(
            "Unable to load the collection. Please refresh the page."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * BUILD CATEGORY LIST FROM REAL DATABASE PRODUCTS
   */
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => product.category?.trim())
          .filter(
            (category): category is string =>
              Boolean(category)
          )
      )
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  /**
   * FILTER PRODUCTS
   */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory =
        product.category?.toLowerCase() || "";

      const productName =
        product.name?.toLowerCase() || "";

      const productDescription =
        product.description?.toLowerCase() || "";

      const matchesCategory =
        category === "All" ||
        productCategory === category.toLowerCase();

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        productCategory.includes(query) ||
        productDescription.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  /**
   * CLEAR FILTERS
   */
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            The Collection
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Discover the Collection
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
            Explore our latest pieces, carefully crafted for modern
            elegance and timeless Nigerian style.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FILTER BAR */}
      {/* ========================================================= */}

      <section className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          {/* SEARCH */}

          <div className="w-full md:max-w-sm">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search collection..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
            />
          </div>

          {/* CATEGORIES */}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs transition ${
                  category === item
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* COLLECTION */}
      {/* ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <h2 className="text-lg font-semibold">
              Unable to load collection
            </h2>

            <p className="mt-2 text-sm text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black"
            >
              Refresh
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
              <h2 className="text-xl font-semibold">
                No products found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
                {products.length === 0
                  ? "Your collection is currently empty. Products added from the admin dashboard will appear here automatically."
                  : "Try another search or category."}
              </p>

              {(search || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <>
              {/* RESULT COUNT */}

              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "Piece"
                    : "Pieces"}
                </p>

                {category !== "All" && (
                  <p className="text-xs text-[#D4AF37]">
                    {category}
                  </p>
                )}
              </div>

              {/* PRODUCT GRID */}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map(
                  (product) => {
                    /**
                     * ALWAYS use the normalized image.
                     */
                    const image =
                      product.images?.[0] ||
                      product.image ||
                      "";

                    const outOfStock =
                      product.stock <= 0 ||
                      product.inStock === false;

                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:-translate-y-1 hover:border-[#D4AF37]/30"
                      >
                        {/* IMAGE */}

                        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-white/20">
                                No image
                              </span>
                            </div>
                          )}

                          {/* BADGES */}

                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            {product.isFeatured && (
                              <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                                Featured
                              </span>
                            )}

                            {product.isNew && (
                              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                                New
                              </span>
                            )}
                          </div>

                          {/* OUT OF STOCK */}

                          {outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                              <span className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs text-white">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* PRODUCT INFORMATION */}

                        <div className="p-5">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">
                            {product.category}
                          </p>

                          <h2 className="mt-2 truncate text-lg font-medium">
                            {product.name}
                          </h2>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">
                            {product.description}
                          </p>

                          <div className="mt-5 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[#D4AF37]">
                                {formatPrice(
                                  product.price
                                )}
                              </p>

                              {product.compareAtPrice &&
                                product.compareAtPrice >
                                  product.price && (
                                  <p className="mt-1 text-[10px] text-white/25 line-through">
                                    {formatPrice(
                                      product.compareAtPrice
                                    )}
                                  </p>
                                )}
                            </div>

                            <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/40 transition group-hover:border-[#D4AF37]/40 group-hover:text-[#D4AF37]">
                              View
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </>
          )}
      </section>
    </main>
  );
}