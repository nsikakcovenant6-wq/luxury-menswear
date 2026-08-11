import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductActions from "./ProductActions";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      image: true,
      imagesJson: true,
      colorsJson: true,
      sizesJson: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      rating: true,
      reviewCount: true,
      isNew: true,
      isFeatured: true,
      inStock: true,
    },
  });

  if (!product) {
    return null;
  }

  let images: string[] = [];
  let colors: string[] = [];
  let sizes: string[] = [];

  try {
    const parsed = JSON.parse(product.imagesJson);

    if (Array.isArray(parsed)) {
      images = parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }
  } catch {
    images = [];
  }

  try {
    const parsed = JSON.parse(product.colorsJson);

    if (Array.isArray(parsed)) {
      colors = parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }
  } catch {
    colors = [];
  }

  try {
    const parsed = JSON.parse(product.sizesJson);

    if (Array.isArray(parsed)) {
      sizes = parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }
  } catch {
    sizes = [];
  }

  if (images.length === 0 && product.image) {
    images = [product.image];
  }

  return {
    ...product,
    images,
    colors,
    sizes,
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Luxury Menswear",
      description:
        "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} | Luxury Menswear`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images:
        product.images.length > 0
          ? [
              {
                url: product.images[0],
                alt: product.name,
              },
            ]
          : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }
  ).format(product.price);

  const formattedCompareAtPrice =
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(product.compareAtPrice)
      : null;

  const isInStock =
    product.stock > 0 && product.inStock;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* =========================
              PRODUCT IMAGES
          ========================== */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[4/5] w-full">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* IMAGE THUMBNAILS */}
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map(
                  (image: string | Blob | undefined, index: number) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =========================
              PRODUCT INFORMATION
          ========================== */}
          <div className="flex flex-col justify-center">
            {/* CATEGORY */}
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
              {product.category}
            </p>

            {/* BADGES */}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.isFeatured && (
                <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                  Featured
                </span>
              )}

              {product.isNew && (
                <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                  New Arrival
                </span>
              )}
            </div>

            {/* NAME */}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            {/* PRICE */}
            <div className="mt-6 flex items-center gap-3">
              <p className="text-2xl font-semibold text-[#D4AF37]">
                {formattedPrice}
              </p>

              {formattedCompareAtPrice && (
                <p className="text-sm text-white/30 line-through">
                  {formattedCompareAtPrice}
                </p>
              )}
            </div>

            {/* RATING */}
            {product.reviewCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-[#D4AF37]">
                  ★
                </span>

                <span className="text-white/70">
                  {product.rating.toFixed(1)}
                </span>

                <span className="text-white/30">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="my-8 h-px bg-white/10" />

            {/* DESCRIPTION */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
                Description
              </h2>

              <p className="mt-3 leading-7 text-white/60">
                {product.description}
              </p>
            </div>

            {/* STOCK */}
            <div className="mt-7">
              <p
                className={
                  isInStock
                    ? "text-sm text-emerald-400"
                    : "text-sm text-red-400"
                }
              >
                {isInStock
                  ? `${product.stock} available`
                  : "Currently out of stock"}
              </p>
            </div>

            {/* =========================
                INTERACTIVE ACTIONS
            ========================== */}
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image:
                  product.images[0] ||
                  product.image ||
                  "",
                stock: product.stock,
                colors: product.colors,
                sizes: product.sizes,
              }}
              disabled={!isInStock}
            />

            {/* BENEFITS */}
            <div className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium">
                  Premium Quality
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Carefully selected materials
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Tailored Fit
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Designed for refined style
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">
                  Secure Checkout
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Safe and reliable ordering
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}