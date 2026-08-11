"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Loader2,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";

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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  const categories = useMemo(() => {
    const values = products.map(
      (product) => product.category
    );

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [products]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response =
          await fetch(
            "/api/products",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {
          setProducts(
            Array.isArray(
              data.products
            )
              ? data.products
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          !query ||
          product.name
            .toLowerCase()
            .includes(query) ||
          product.category
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          activeCategory ===
            "All" ||
          product.category ===
            activeCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    products,
    search,
    activeCategory,
  ]);

  const featuredProducts =
    products.filter(
      (product) =>
        product.isFeatured
    );

  const collectionProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : products;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <a
            href="/"
            className="text-lg font-semibold tracking-[0.28em] text-[#D4AF37]"
          >
            BENKASO
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#collections"
              className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white"
            >
              Collections
            </a>

            <a
              href="#featured"
              className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white"
            >
              Featured
            </a>

            <a
              href="#about"
              className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-white"
            >
              About
            </a>

            <a
              href="/admin"
              className="text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
            >
              Admin
            </a>
          </nav>

          <a
            href="#collections"
            className="rounded-full border border-[#D4AF37]/40 p-2.5 text-[#D4AF37]"
          >
            <ShoppingBag className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Bespoke Menswear
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">
              Designed for
              <span className="block text-[#D4AF37]">
                distinction.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
              Discover premium suits,
              agbada, senator wear,
              kaftans and bespoke
              menswear crafted with
              precision and elegance.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#collections"
                className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#about"
                className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/60 hover:bg-white/5"
              >
                Discover Benkaso
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section
        id="featured"
        className="border-y border-white/10"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Featured Collection
              </p>

              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Our Latest Designs
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
                Every product shown here is
                loaded directly from your
                admin dashboard.
              </p>
            </div>

            <a
              href="#collections"
              className="flex items-center gap-2 text-sm text-[#D4AF37]"
            >
              View collection
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : collectionProducts.length ===
            0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 py-24 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-white/10" />

              <h3 className="mt-5 text-lg font-medium">
                Collection coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
                Your collection is
                currently empty. Add
                products from the admin
                dashboard and they will
                automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {collectionProducts
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* COLLECTION SEARCH */}
      <section
        id="collections"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
            The Collection
          </p>

          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Explore our designs
          </h2>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search collection..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-4 pl-11 pr-4 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                  className={`whitespace-nowrap rounded-xl border px-4 py-3 text-xs transition ${
                    activeCategory ===
                    category
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                      : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-8">
          {visibleProducts.length ===
          0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center">
              <ShoppingBag className="mx-auto h-9 w-9 text-white/10" />

              <p className="mt-4 text-sm text-white/40">
                No products found.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Benkaso Collection
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Modern African
              <span className="text-[#D4AF37]">
                {" "}
                elegance.
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-white/40">
              Benkaso combines refined
              tailoring with contemporary
              African menswear. Each design
              is created for men who value
              confidence, precision and
              timeless style.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            Benkaso Collection. All rights
            reserved.
          </p>

          <a
            href="/admin"
            className="text-[#D4AF37]"
          >
            Manage Collection
          </a>
        </div>
      </footer>
    </main>
  );
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const image =
    product.images?.[0] || "";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
        {image ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url("${image}")`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          {product.isFeatured && (
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-[9px] font-semibold text-black">
              Featured
            </span>
          )}

          {product.isNew && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-black">
              New
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">
          {product.category}
        </p>

        <h3 className="mt-2 font-semibold">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-semibold text-[#D4AF37]">
            {formatPrice(product.price)}
          </p>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />

              {product.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}