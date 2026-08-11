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
      order.paymentMethod !==
      "BANK_TRANSFER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order does not use bank transfer.",
        },
        { status: 400 }
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
            "This payment has already been approved.",
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

    /*
     * Verify stock one final time immediately
     * before deducting it.
     */
    for (const item of order.items) {
      if (
        !item.product.inStock ||
        item.product.stock < item.quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${item.product.name} no longer has enough stock.`,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    const updatedOrder =
      await prisma.$transaction(
        async (tx: { product: { update: (arg0: { where: { id: any; }; data: { stock: { decrement: any; }; inStock: boolean; }; }) => any; }; order: { update: (arg0: { where: { id: any; }; data: { paymentStatus: string; status: string; paidAt: Date; approvedAt: Date; paymentNote: any; }; include: { user: { select: { id: boolean; name: boolean; email: boolean; phone: boolean; }; }; items: { include: { product: boolean; }; }; }; }) => any; }; }) => {
          /*
           * Deduct stock ONLY after payment
           * has been verified by the admin.
           */
          for (const item of order.items) {
            const newStock =
              item.product.stock -
              item.quantity;

            await tx.product.update({
              where: {
                id: item.productId,
              },

              data: {
                stock: {
                  decrement:
                    item.quantity,
                },

                inStock:
                  newStock > 0,
              },
            });
          }

          /*
           * Mark the order as paid and
           * move it to processing.
           */
          return tx.order.update({
            where: {
              id: order.id,
            },

            data: {
              paymentStatus: "PAID",

              status: "PROCESSING",

              paidAt: now,

              approvedAt: now,

              paymentNote:
                note ||
                `Payment approved by ${admin.name}.`,
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
        }
      );

    return NextResponse.json({
      success: true,

      message:
        "Payment approved successfully.",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Approve payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to approve payment.",
      },
      { status: 500 }
    );
  }
}