import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to modify your cart.",
        },
        { status: 401 }
      );
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session has expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const quantity = Number(body.quantity);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be at least 1.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
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

    if (!product.inStock || product.stock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This product is currently out of stock.",
        },
        { status: 400 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${product.stock} item${
            product.stock === 1 ? "" : "s"
          } available.`,
        },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: payload.userId,
      },
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart was not found.",
        },
        { status: 404 }
      );
    }

    const cartItem =
      await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Product is not in your cart.",
        },
        { status: 404 }
      );
    }

    const updatedItem =
      await prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity,
        },
        include: {
          Product: true,
        },
      });

    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully.",
      cartItem: {
        id: updatedItem.id,
        productId: updatedItem.productId,
        quantity: updatedItem.quantity,
        product: updatedItem.Product,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/cart/update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart.",
      },
      { status: 500 }
    );
  }
}