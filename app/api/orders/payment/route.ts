import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req: NextRequest) {
  try {
    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in.",
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

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

    const userId = payload.userId ?? payload.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication session.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    const body = await req.json().catch(() => ({}));

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim()
        : "";

    const paymentReference =
      typeof body.paymentReference === "string"
        ? body.paymentReference.trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    if (!paymentReference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
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

    // --------------------------------------------------
    // PAYMENT VALIDATION
    // --------------------------------------------------

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "This order has already been paid.",
        },
        { status: 400 }
      );
    }

    if (
      order.paymentStatus ===
      "AWAITING_VERIFICATION"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment is already awaiting verification.",
        },
        { status: 400 }
      );
    }

    if (
      order.paymentMethod !== "BANK_TRANSFER"
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

    // --------------------------------------------------
    // UPDATE PAYMENT
    // --------------------------------------------------

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentReference,

          paymentStatus:
            "AWAITING_VERIFICATION",

          status:
            "AWAITING_PAYMENT_VERIFICATION",

          paymentConfirmedAt:
            new Date(),
        },
      });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Payment submitted. We will verify your transfer shortly.",

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "PATCH /api/orders/payment error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit payment.",
      },
      { status: 500 }
    );
  }
}