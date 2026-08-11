"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  collection?: string | null;
  price: number;
  images: string[];
  description: string;
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
}

export default function Collections() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response =
          await fetch("/api/products", {
            cache: "no-store",
          });

        const data =
          await response.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error(
          "Failed to load collections:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const collections = Array.from(
    new Set(
      products
        .map(
          (product) =>
            product.collection ||
            product.category
        )
        .filter(Boolean)
    )
  );

  if (loading) {
    return (
      <section className="px-6 py-24 text-center">
        <p className="text-white/40">
          Loading collections...
        </p>
      </section>
    );
  }

  return (
    <section
      id="collections"
      className="bg-[#0B0B0B] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Curated Collections
          </p>

          <h2 className="mt-3 text-4xl font-semibold">
            Our Collections
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/40">
            Discover premium menswear crafted
            for distinguished gentlemen.
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <p className="text-white/30">
              Collections coming soon.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map(
              (collection) => {
                const collectionProducts =
                  products.filter(
                    (product) =>
                      (product.collection ||
                        product.category) ===
                      collection
                  );

                const product =
                  collectionProducts[0];

                return (
                  <div
                    key={collection}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                      {product?.images?.[0] ? (
                        <img
                          src={
                            product.images[0]
                          }
                          alt={collection}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-white/20">
                            No image
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                          Collection
                        </p>

                        <h3 className="mt-2 text-2xl font-semibold">
                          {collection}
                        </h3>

                        <p className="mt-2 text-xs text-white/50">
                          {
                            collectionProducts.length
                          }{" "}
                          product
                          {collectionProducts.length ===
                          1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}