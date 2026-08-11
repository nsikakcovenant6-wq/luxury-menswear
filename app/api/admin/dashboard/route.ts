import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin";

export async function GET(
  req: NextRequest
) {
  try {
    const admin =
      await getAdminFromRequest(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const [
      totalCustomers,
      totalOrders,
      paidOrders,
      pendingPayments,
      processingOrders,
      deliveredOrders,
      awaitingVerification,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.order.count(),

      prisma.order.count({
        where: {
          paymentStatus: "PAID",
        },
      }),

      prisma.order.count({
        where: {
          paymentStatus: {
            in: [
              "PENDING",
              "AWAITING_VERIFICATION",
              "REJECTED",
            ],
          },
        },
      }),

      prisma.order.count({
        where: {
          status: "PROCESSING",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          paymentStatus:
            "AWAITING_VERIFICATION",
        },
      }),
    ]);

    const paidOrdersData =
      await prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
        },

        select: {
          total: true,
        },
      });

    const totalRevenue =
      paidOrdersData.reduce(
        (sum: any, order: { total: any; }) =>
          sum + order.total,
        0
      );

    const recentOrders =
      await prisma.order.findMany({
        take: 8,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      success: true,

      stats: {
        totalCustomers,
        totalOrders,
        paidOrders,
        pendingPayments,
        awaitingVerification,
        processingOrders,
        deliveredOrders,
        totalRevenue,
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/dashboard error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load admin dashboard.",
      },
      { status: 500 }
    );
  }
}