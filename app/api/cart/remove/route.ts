import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
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

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
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
          message: "Your cart is empty.",
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

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
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
      message: "Product removed from cart.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart/remove error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove product from cart.",
      },
      { status: 500 }
    );
  }
}