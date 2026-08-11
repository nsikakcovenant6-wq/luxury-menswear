import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to view your orders.",
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

    const orders = await prisma.order.findMany({
      where: {
        userId: payload.userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order: { id: any; total: any; status: any; paymentMethod: any; paymentStatus: any; paymentReference: any; paymentConfirmedAt: any; createdAt: any; updatedAt: any; OrderItem: any[]; }) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      paymentConfirmedAt: order.paymentConfirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: order.OrderItem.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.Product.name,
        image: item.Product.image,
        slug: item.Product.slug,
        category: item.Product.category,
        price: item.price,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your orders.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to place an order.",
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

    const userId = payload.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer account not found.",
        },
        { status: 404 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        CartItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!cart || cart.CartItem.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    for (const item of cart.CartItem) {
      if (
        !item.Product.inStock ||
        item.Product.stock < item.quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${item.Product.name} does not have enough stock available.`,
          },
          { status: 400 }
        );
      }
    }

    const total = cart.CartItem.reduce(
      (sum: number, item: { Product: { price: number; }; quantity: number; }) =>
        sum + item.Product.price * item.quantity,
      0
    );

    const now = new Date();

    const order = await prisma.$transaction(async (tx: { order: { create: (arg0: { data: { id: `${string}-${string}-${string}-${string}-${string}`; userId: string; total: any; status: string; paymentMethod: string; paymentStatus: string; createdAt: Date; updatedAt: Date; OrderItem: { create: any; }; }; include: { OrderItem: { include: { Product: boolean; }; }; }; }) => any; }; cartItem: { deleteMany: (arg0: { where: { cartId: any; }; }) => any; }; }) => {
      const createdOrder = await tx.order.create({
        data: {
          id: crypto.randomUUID(),

          userId,

          total,

          status: "PENDING_PAYMENT",

          paymentMethod: "BANK_TRANSFER",

          paymentStatus: "PENDING",

          createdAt: now,

          updatedAt: now,

          OrderItem: {
            create: cart.CartItem.map((item: { productId: any; quantity: any; Product: { price: any; }; }) => ({
              id: crypto.randomUUID(),

              productId: item.productId,

              quantity: item.quantity,

              price: item.Product.price,
            })),
          },
        },

        include: {
          OrderItem: {
            include: {
              Product: true,
            },
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully. Please complete your bank transfer.",

        order: {
          id: order.id,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,

          items: order.OrderItem.map((item: { id: any; productId: any; Product: { name: any; image: any; }; quantity: any; price: any; }) => ({
            id: item.id,
            productId: item.productId,
            name: item.Product.name,
            image: item.Product.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },

        customer: user,
      },

      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create your order.",
      },
      { status: 500 }
    );
  }
}