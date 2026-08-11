import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to add items to your cart.",
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

    const requestedQuantity =
      Number.isInteger(body.quantity) &&
      body.quantity > 0
        ? body.quantity
        : 1;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
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

    const existingCart = await prisma.cart.findUnique({
      where: {
        userId: payload.userId,
      },
      include: {
        CartItem: true,
      },
    });

    let cart;

    if (!existingCart) {
      cart = await prisma.cart.create({
        data: {
          id: `cart_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          userId: payload.userId,
          updatedAt: new Date(),
        },
      });
    } else {
      cart = existingCart;
    }

    const existingItem =
      await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

    const newQuantity = existingItem
      ? existingItem.quantity + requestedQuantity
      : requestedQuantity;

    if (newQuantity > product.stock) {
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

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          Product: true,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          id: `cartitem_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          cartId: cart.id,
          productId,
          quantity: requestedQuantity,
        },
        include: {
          Product: true,
        },
      });
    }

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
      message: "Product added to cart.",
      cartItem: {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        product: cartItem.Product,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/cart/add error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product to cart.",
      },
      { status: 500 }
    );
  }
}