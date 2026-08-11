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
          message: "Authentication required.",
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

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        OrderItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order: { id: any; total: any; status: any; paymentMethod: any; paymentStatus: any; paymentReference: any; paymentConfirmedAt: any; createdAt: any; updatedAt: any; User: { id: any; name: any; email: any; phone: any; }; OrderItem: any[]; }) => ({
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

      customer: {
        id: order.User.id,
        name: order.User.name,
        email: order.User.email,
        phone: order.User.phone,
      },

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

    return NextResponse.json(
      {
        success: true,
        orders: formattedOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load orders.",
      },
      { status: 500 }
    );
  }
}