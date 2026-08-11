import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string"
    );
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === "string"
    );
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authentication token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Verify authentication token
    let payload;

    try {
      payload = verifyToken(token);
    } catch (error) {
      console.error(
        "Cart token verification error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // verifyToken can return null
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // Get user ID from JWT
    const userId =
      payload.userId ?? payload.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid session. User ID is missing.",
        },
        { status: 401 }
      );
    }

    // Find customer's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        CartItem: {
          include: {
            Product: {
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
                inStock: true,
              },
            },
          },
        },
      },
    });

    // No cart yet
    if (!cart) {
      return NextResponse.json({
        success: true,

        cart: {
          id: null,
          userId,
          items: [],
        },
      });
    }

    // Convert Prisma CartItem records
    // into the structure expected by the frontend
    const items = cart.CartItem.map(
      (item: { Product: { imagesJson: unknown; colorsJson: unknown; sizesJson: unknown; image: any; id: any; slug: any; name: any; category: any; description: any; price: any; compareAtPrice: any; stock: number; inStock: any; }; id: any; productId: any; quantity: any; }) => {
        const images = parseJsonArray(
          item.Product.imagesJson
        );

        const colors = parseJsonArray(
          item.Product.colorsJson
        );

        const sizes = parseJsonArray(
          item.Product.sizesJson
        );

        // Determine main product image
        const mainImage =
          item.Product.image ||
          images[0] ||
          "";

        return {
          id: item.id,

          productId: item.productId,

          quantity: item.quantity,

          product: {
            id: item.Product.id,

            slug: item.Product.slug,

            name: item.Product.name,

            category:
              item.Product.category,

            description:
              item.Product.description,

            image: mainImage,

            images:
              images.length > 0
                ? images
                : mainImage
                ? [mainImage]
                : [],

            colors,

            sizes,

            price: item.Product.price,

            compareAtPrice:
              item.Product.compareAtPrice,

            stock: item.Product.stock,

            inStock:
              Boolean(
                item.Product.inStock
              ) &&
              item.Product.stock > 0,
          },
        };
      }
    );

    // Return customer's cart
    return NextResponse.json({
      success: true,

      cart: {
        id: cart.id,

        userId: cart.userId,

        items,

        createdAt: cart.createdAt,

        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to load cart.",
      },
      { status: 500 }
    );
  }
}