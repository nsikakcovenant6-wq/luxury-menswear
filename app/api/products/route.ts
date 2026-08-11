import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(
  name: string
): Promise<string> {
  const baseSlug = slugify(name) || "product";

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
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

    inStock: product.inStock && product.stock > 0,

    stock: product.stock,
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const search =
      searchParams.get("search")?.trim() || "";

    const category =
      searchParams.get("category")?.trim() || "";

    const products = await prisma.product.findMany({
      where: {
        ...(category
          ? {
              category: {
                equals: category,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      products: products.map(serializeProduct),
    });
  } catch (error) {
    console.error(
      "GET /api/products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      category,
      description,
      images,
      price,
      compareAtPrice,
      stock,
      colors,
      sizes,
      featured,
      newArrival,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product description is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof category !== "string" ||
      !category.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product category is required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product price is required.",
        },
        { status: 400 }
      );
    }

    const numericStock = Number(stock ?? 0);

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock must be a valid number.",
        },
        { status: 400 }
      );
    }

    const productImages = Array.isArray(images)
      ? images.filter(
          (image): image is string =>
            typeof image === "string" &&
            image.trim().length > 0
        )
      : [];

    if (productImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one product image is required.",
        },
        { status: 400 }
      );
    }

    const productColors = Array.isArray(colors)
      ? colors.filter(
          (color): color is string =>
            typeof color === "string"
        )
      : [];

    const productSizes = Array.isArray(sizes)
      ? sizes.filter(
          (size): size is string =>
            typeof size === "string"
        )
      : [];

    const slug = await createUniqueSlug(name);

    const product =
      await prisma.product.create({
        data: {
          slug,
          name: name.trim(),
          category: category.trim(),
          description: description.trim(),

          image: productImages[0],
          imagesJson: JSON.stringify(
            productImages
          ),

          colorsJson: JSON.stringify(
            productColors
          ),

          sizesJson: JSON.stringify(
            productSizes
          ),

          price: numericPrice,

          compareAtPrice:
            compareAtPrice !== undefined &&
            compareAtPrice !== null &&
            compareAtPrice !== ""
              ? Number(compareAtPrice)
              : null,

          stock: Math.floor(numericStock),

          isNew: Boolean(newArrival),
          isFeatured: Boolean(featured),

          inStock: numericStock > 0,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product created successfully.",
        product: serializeProduct(product),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product.",
      },
      { status: 500 }
    );
  }
}