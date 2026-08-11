import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseJsonArray(
  value: string | null | undefined
): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0
    );
  } catch {
    return [];
  }
}

function serializeProduct(product: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  imagesJson: string;
  colorsJson: string;
  sizesJson: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
}) {
  const images = parseJsonArray(product.imagesJson);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,

    price: product.price,

    compareAtPrice:
      product.compareAtPrice ?? undefined,

    images:
      images.length > 0
        ? images
        : product.image
          ? [product.image]
          : [],

    description: product.description,

    colors: parseJsonArray(product.colorsJson),

    sizes: parseJsonArray(product.sizesJson),

    rating: product.rating,

    reviewCount: product.reviewCount,

    isNew: product.isNew,

    isFeatured: product.isFeatured,

    inStock:
      product.inStock &&
      product.stock > 0,

    stock: product.stock,
  };
}

export async function GET() {
  try {
    /*
     * Get featured products
     */
    const featuredProducts =
      await prisma.product.findMany({
        where: {
          isFeatured: true,
          inStock: true,
          stock: {
            gt: 0,
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 12,
      });

    /*
     * Get new arrivals
     */
    const newArrivals =
      await prisma.product.findMany({
        where: {
          isNew: true,
          inStock: true,
          stock: {
            gt: 0,
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 12,
      });

    /*
     * Get all available products.
     * This allows the homepage to still
     * display products even when featured/new
     * flags have not been enabled yet.
     */
    const products =
      await prisma.product.findMany({
        where: {
          inStock: true,
          stock: {
            gt: 0,
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 24,
      });

    /*
     * Build category information from products.
     */
    const categoryMap =
      new Map<
        string,
        {
          name: string;
          count: number;
          image: string;
        }
      >();

    for (const product of products) {
      const images =
        parseJsonArray(product.imagesJson);

      const image =
        images[0] ||
        product.image ||
        "";

      const existing =
        categoryMap.get(product.category);

      if (existing) {
        existing.count += 1;

        if (!existing.image && image) {
          existing.image = image;
        }
      } else {
        categoryMap.set(product.category, {
          name: product.category,
          count: 1,
          image,
        });
      }
    }

    const categories =
      Array.from(categoryMap.values());

    return NextResponse.json({
      success: true,

      featuredProducts:
        featuredProducts.map(
          serializeProduct
        ),

      newArrivals:
        newArrivals.map(
          serializeProduct
        ),

      products:
        products.map(
          serializeProduct
        ),

      categories,
    });
  } catch (error) {
    console.error(
      "GET /api/homepage error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load homepage data.",
        featuredProducts: [],
        newArrivals: [],
        products: [],
        categories: [],
      },
      {
        status: 500,
      }
    );
  }
}