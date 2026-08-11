import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

function parseJsonArray(
  value: string | null | undefined
): string[] {
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

function serializeProduct(product: any) {
  const images = parseJsonArray(
    product.imagesJson
  );

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

    colors: parseJsonArray(
      product.colorsJson
    ),

    sizes: parseJsonArray(
      product.sizesJson
    ),

    rating: product.rating,
    reviewCount: product.reviewCount,

    isNew: product.isNew,
    isFeatured: product.isFeatured,

    inStock:
      product.inStock && product.stock > 0,

    stock: product.stock,
  };
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const product =
      await prisma.product.findUnique({
        where: { id },
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    console.error(
      "GET /api/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing =
      await prisma.product.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

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

    const data: any = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();

      const newBaseSlug = slugify(name);

      if (
        newBaseSlug &&
        newBaseSlug !== existing.slug
      ) {
        let newSlug = newBaseSlug;
        let counter = 2;

        while (true) {
          const duplicate =
            await prisma.product.findFirst({
              where: {
                slug: newSlug,
                NOT: { id },
              },
              select: { id: true },
            });

          if (!duplicate) break;

          newSlug = `${newBaseSlug}-${counter}`;
          counter += 1;
        }

        data.slug = newSlug;
      }
    }

    if (
      typeof category === "string" &&
      category.trim()
    ) {
      data.category = category.trim();
    }

    if (typeof description === "string") {
      data.description =
        description.trim();
    }

    if (Array.isArray(images)) {
      const productImages =
        images.filter(
          (image): image is string =>
            typeof image === "string" &&
            image.trim().length > 0
        );

      if (productImages.length > 0) {
        data.image = productImages[0];
        data.imagesJson =
          JSON.stringify(productImages);
      }
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product price.",
          },
          { status: 400 }
        );
      }

      data.price = numericPrice;
    }

    if (
      compareAtPrice !== undefined
    ) {
      data.compareAtPrice =
        compareAtPrice === null ||
        compareAtPrice === ""
          ? null
          : Number(compareAtPrice);
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);

      if (
        !Number.isFinite(numericStock) ||
        numericStock < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid stock value.",
          },
          { status: 400 }
        );
      }

      data.stock = Math.floor(
        numericStock
      );

      data.inStock =
        numericStock > 0;
    }

    if (Array.isArray(colors)) {
      data.colorsJson =
        JSON.stringify(
          colors.filter(
            (color): color is string =>
              typeof color === "string"
          )
        );
    }

    if (Array.isArray(sizes)) {
      data.sizesJson =
        JSON.stringify(
          sizes.filter(
            (size): size is string =>
              typeof size === "string"
          )
        );
    }

    if (featured !== undefined) {
      data.isFeatured =
        Boolean(featured);
    }

    if (newArrival !== undefined) {
      data.isNew =
        Boolean(newArrival);
    }

    const product =
      await prisma.product.update({
        where: { id },
        data,
      });

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully.",
      product: serializeProduct(product),
    });
  } catch (error) {
    console.error(
      "PUT /api/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const existing =
      await prisma.product.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/products/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}