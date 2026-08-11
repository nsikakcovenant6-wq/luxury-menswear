"use client";

import { useEffect, useMemo, useState } from "react";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import SuitConfigurator from "@/components/SuitConfigurator";
import Testimonials from "@/components/Testimonials";
import InstagramGallery from "@/components/InstagramGallery";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Whatsapp from "@/components/Whatsapp";
import BackToTop from "@/components/BackToTop";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  stock: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category))
    );

    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products;
    }

    return products.filter(
      (product) => product.category === activeCategory
    );
  }, [products, activeCategory]);

  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.isFeatured)
      .slice(0, 8);
  }, [products]);

  const newProducts = useMemo(() => {
    return products
      .filter((product) => product.isNew)
      .slice(0, 8);
  }, [products]);

  return (
    <Hero>
      <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">

        {/* =========================================================
            INTRO
        ========================================================= */}
        <Intro children={undefined} />

        {/* =========================================================
            FEATURED PRODUCTS
        ========================================================= */}
        <section className="px-6 py-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">

            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                  Curated Collection
                </p>

                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                  Featured Designs
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                  Discover our carefully selected pieces, updated directly
                  from the Kaventra administration dashboard.
                </p>
              </div>
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : featuredProducts.length === 0 ? (
              <EmptyState message="No featured products yet." />
            ) : (
              <ProductGrid products={featuredProducts} />
            )}
          </div>
        </section>

        {/* =========================================================
            ALL COLLECTIONS
        ========================================================= */}
        <section className="px-6 py-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">

            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                Our Collection
              </p>

              <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                All African Wear
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/40">
                Premium menswear designed for gentlemen who appreciate
                craftsmanship, detail and timeless style.
              </p>
            </div>

            {/* Categories */}
            {!loading && categories.length > 1 && (
              <div className="mb-10 flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-5 py-2.5 text-xs transition ${
                      activeCategory === category
                        ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <ProductSkeleton />
            ) : filteredProducts.length === 0 ? (
              <EmptyState message="No products available in this collection." />
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </section>

        {/* =========================================================
            NEW ARRIVALS
        ========================================================= */}
        {newProducts.length > 0 && (
          <section className="px-6 py-20 md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">

              <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
                  Just Arrived
                </p>

                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
                  New Arrivals
                </h2>
              </div>

              <ProductGrid products={newProducts} />
            </div>
          </section>
        )}

        {/* =========================================================
            SUIT CONFIGURATOR
        ========================================================= */}
        <SuitConfigurator />

        {/* =========================================================
            TESTIMONIALS
        ========================================================= */}
        <Testimonials />

        {/* =========================================================
            INSTAGRAM
        ========================================================= */}
        <InstagramGallery />

        {/* =========================================================
            NEWSLETTER
        ========================================================= */}
        <Newsletter />

        {/* =========================================================
            FOOTER
        ========================================================= */}
        <Footer />

        {/* =========================================================
            WHATSAPP
        ========================================================= */}
        <Whatsapp />

        {/* =========================================================
            BACK TO TOP
        ========================================================= */}
        <BackToTop />

      </main>
    </Hero>
  );
}

/* ================================================================
   PRODUCT GRID
================================================================ */

function ProductGrid({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

/* ================================================================
   PRODUCT CARD
================================================================ */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const image = product.images?.[0];

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/30">

      {/* IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/20">
            No image
          </div>
        )}

        {/* BADGES */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isNew && (
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
              New
            </span>
          )}

          {product.isFeatured && (
            <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
              Featured
            </span>
          )}
        </div>

        {/* STOCK */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs uppercase tracking-widest text-white/70">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-5">

        <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
          {product.category}
        </p>

        <h3 className="mt-2 line-clamp-1 text-lg font-semibold">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">

          <div>
            <p className="font-semibold text-[#D4AF37]">
              {formatPrice(product.price)}
            </p>

            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <p className="mt-1 text-xs text-white/30 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
          </div>

          <span
            className={`text-[10px] uppercase tracking-wider ${
              product.inStock
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {product.inStock
              ? `${product.stock} available`
              : "Unavailable"}
          </span>

        </div>

        {/* VIEW BUTTON */}
        <a
          href={`/collections/${product.slug}`}
          className="mt-5 block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-medium text-white/70 transition hover:border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-black"
        >
          View Product
        </a>

      </div>
    </article>
  );
}

/* ================================================================
   LOADING
================================================================ */

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <div className="aspect-[4/5] animate-pulse bg-white/5" />

          <div className="space-y-3 p-5">
            <div className="h-2 w-20 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <p className="text-sm text-white/40">
        {message}
      </p>

      <p className="mt-2 text-xs text-white/20">
        Add products from the admin dashboard.
      </p>
    </div>
  );
}