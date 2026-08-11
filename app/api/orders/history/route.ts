import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

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
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                imagesJson: true,
                category: true,
                price: true,
              },
            },
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
      paymentConfirmedAt:
        order.paymentConfirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: order.OrderItem.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,

        product: {
          id: item.Product.id,
          name: item.Product.name,
          slug: item.Product.slug,
          image: item.Product.image,
          imagesJson: item.Product.imagesJson,
          category: item.Product.category,
          price: item.Product.price,
        },
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error(
      "GET /api/orders/history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load order history.",
      },
      { status: 500 }
    );
  }
}