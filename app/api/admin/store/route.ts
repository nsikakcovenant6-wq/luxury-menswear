import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const [
      categories,
      collections,
      paymentSettings,
      users,
      orders,
    ] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),

      prisma.collection.findMany({
        orderBy: { createdAt: "desc" },
      }),

      prisma.paymentSettings.upsert({
        where: { id: "main" },
        update: {},
        create: {
          id: "main",
        },
      }),

      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.order.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      categories,
      collections,
      paymentSettings,
      users,
      orders,
    });
  } catch (error) {
    console.error("ADMIN STORE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store management data.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const action = body.action;

    /* =========================
       CREATE CATEGORY
    ========================= */

    if (action === "create-category") {
      const name = String(body.name || "").trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name is required.",
          },
          { status: 400 }
        );
      }

      const slug = slugify(name);

      const category = await prisma.category.create({
        data: {
          name,
          slug,
        },
      });

      return NextResponse.json({
        success: true,
        category,
      });
    }

    /* =========================
       DELETE CATEGORY
    ========================= */

    if (action === "delete-category") {
      const id = String(body.id || "");

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "Category ID is required.",
          },
          { status: 400 }
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Category deleted.",
      });
    }

    /* =========================
       CREATE COLLECTION
    ========================= */

    if (action === "create-collection") {
      const name = String(body.name || "").trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Collection name is required.",
          },
          { status: 400 }
        );
      }

      const slug = slugify(name);

      const collection =
        await prisma.collection.create({
          data: {
            name,
            slug,
            description:
              body.description
                ? String(body.description)
                : null,
            image:
              body.image
                ? String(body.image)
                : null,
            isActive:
              body.isActive !== false,
          },
        });

      return NextResponse.json({
        success: true,
        collection,
      });
    }

    /* =========================
       DELETE COLLECTION
    ========================= */

    if (action === "delete-collection") {
      const id = String(body.id || "");

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "Collection ID is required.",
          },
          { status: 400 }
        );
      }

      await prisma.collection.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Collection deleted.",
      });
    }

    /* =========================
       PAYMENT SETTINGS
    ========================= */

    if (action === "update-payment-settings") {
      const settings =
        await prisma.paymentSettings.upsert({
          where: {
            id: "main",
          },

          update: {
            bankTransferEnabled:
              Boolean(
                body.bankTransferEnabled
              ),

            paystackEnabled:
              Boolean(
                body.paystackEnabled
              ),

            bankName:
              String(
                body.bankName || ""
              ).trim(),

            accountName:
              String(
                body.accountName || ""
              ).trim(),

            accountNumber:
              String(
                body.accountNumber || ""
              ).trim(),

            currency:
              String(
                body.currency || "NGN"
              ).trim(),

            supportPhone:
              String(
                body.supportPhone || ""
              ).trim(),

            supportEmail:
              String(
                body.supportEmail || ""
              ).trim(),
          },

          create: {
            id: "main",

            bankTransferEnabled:
              Boolean(
                body.bankTransferEnabled
              ),

            paystackEnabled:
              Boolean(
                body.paystackEnabled
              ),

            bankName:
              String(
                body.bankName || ""
              ).trim(),

            accountName:
              String(
                body.accountName || ""
              ).trim(),

            accountNumber:
              String(
                body.accountNumber || ""
              ).trim(),

            currency:
              String(
                body.currency || "NGN"
              ).trim(),

            supportPhone:
              String(
                body.supportPhone || ""
              ).trim(),

            supportEmail:
              String(
                body.supportEmail || ""
              ).trim(),
          },
        });

      return NextResponse.json({
        success: true,
        settings,
      });
    }

    /* =========================
       MARK ORDER PAID
    ========================= */

    if (action === "mark-paid") {
      const id = String(body.id || "");

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "Order ID is required.",
          },
          { status: 400 }
        );
      }

      const order =
        await prisma.order.update({
          where: {
            id,
          },

          data: {
            status: "PAID",
            paidAt: new Date(),

            paymentReference:
              body.paymentReference
                ? String(
                    body.paymentReference
                  )
                : undefined,
          },
        });

      return NextResponse.json({
        success: true,
        order,
      });
    }

    /* =========================
       UPDATE ORDER STATUS
    ========================= */

    if (action === "update-order-status") {
      const id = String(body.id || "");
      const status = String(body.status || "").trim();

      const allowed = [
        "PENDING",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          { status: 400 }
        );
      }

      const order =
        await prisma.order.update({
          where: {
            id,
          },

          data: {
            status,

            ...(status === "PAID"
              ? {
                  paidAt: new Date(),
                }
              : {}),
          },
        });

      return NextResponse.json({
        success: true,
        order,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unknown admin action.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(
      "ADMIN STORE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.code === "P2002"
            ? "That name already exists."
            : "Admin operation failed.",
      },
      { status: 500 }
    );
  }
}