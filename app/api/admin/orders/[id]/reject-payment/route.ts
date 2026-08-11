import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  context: RouteContext
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

    const { id } =
      await context.params;

    const body =
      await req.json().catch(
        () => ({})
      );

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : "";

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (
      order.paymentStatus ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A paid order cannot be rejected.",
        },
        { status: 400 }
      );
    }

    if (
      order.paymentStatus !==
      "AWAITING_VERIFICATION"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment is not awaiting verification.",
        },
        { status: 400 }
      );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          paymentStatus:
            "REJECTED",

          status:
            "PENDING_PAYMENT",

          paymentNote:
            note ||
            `Payment rejected by ${admin.name}.`,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },

          items: {
            include: {
              product: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,

      message:
        "Payment rejected.",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Reject payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to reject payment.",
      },
      { status: 500 }
    );
  }
}