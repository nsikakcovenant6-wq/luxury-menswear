import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/*
 * GET /api/admin/orders/[id]
 *
 * Get one order with customer and products.
 *
 * Prisma relation names from schema:
 * Order.User
 * Order.OrderItem
 * OrderItem.Product
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await getAdminFromRequest(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
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

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Return a frontend-friendly structure.
     *
     * The database uses:
     * User
     * OrderItem
     * Product
     *
     * The admin frontend can continue receiving:
     * user
     * items
     * product
     */
    const formattedOrder = {
      id: order.id,
      userId: order.userId,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference,
      paymentConfirmedAt: order.paymentConfirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      user: order.User
        ? {
            id: order.User.id,
            name: order.User.name,
            email: order.User.email,
            phone: order.User.phone,
          }
        : null,

      items: order.OrderItem.map((item: { id: any; orderId: any; productId: any; quantity: any; price: any; Product: { id: any; slug: any; name: any; category: any; description: any; image: any; imagesJson: any; colorsJson: any; sizesJson: any; price: any; compareAtPrice: any; stock: any; rating: any; reviewCount: any; isNew: any; isFeatured: any; inStock: any; createdAt: any; updatedAt: any; }; }) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,

        product: item.Product
          ? {
              id: item.Product.id,
              slug: item.Product.slug,
              name: item.Product.name,
              category: item.Product.category,
              description: item.Product.description,
              image: item.Product.image,
              imagesJson: item.Product.imagesJson,
              colorsJson: item.Product.colorsJson,
              sizesJson: item.Product.sizesJson,
              price: item.Product.price,
              compareAtPrice:
                item.Product.compareAtPrice,
              stock: item.Product.stock,
              rating: item.Product.rating,
              reviewCount:
                item.Product.reviewCount,
              isNew: item.Product.isNew,
              isFeatured:
                item.Product.isFeatured,
              inStock: item.Product.inStock,
              createdAt:
                item.Product.createdAt,
              updatedAt:
                item.Product.updatedAt,
            }
          : null,
      })),
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load order.",
      },
      { status: 500 }
    );
  }
}

/*
 * PATCH /api/admin/orders/[id]
 *
 * Approve or reject customer payment.
 *
 * APPROVE:
 * paymentStatus = PAID
 * status = PROCESSING
 * paymentConfirmedAt = now
 *
 * REJECT:
 * paymentStatus = REJECTED
 * status = PENDING_PAYMENT
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await getAdminFromRequest(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const action =
      typeof body.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment action. Use APPROVE or REJECT.",
        },
        { status: 400 }
      );
    }

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * APPROVE PAYMENT
     */
    if (action === "APPROVE") {
      if (
        existingOrder.paymentStatus === "PAID"
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

      const updatedOrder =
        await prisma.order.update({
          where: {
            id,
          },
          data: {
            paymentStatus: "PAID",
            paymentConfirmedAt: new Date(),
            status: "PROCESSING",
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

      const formattedOrder = {
        id: updatedOrder.id,
        userId: updatedOrder.userId,
        total: updatedOrder.total,
        status: updatedOrder.status,
        paymentMethod:
          updatedOrder.paymentMethod,
        paymentStatus:
          updatedOrder.paymentStatus,
        paymentReference:
          updatedOrder.paymentReference,
        paymentConfirmedAt:
          updatedOrder.paymentConfirmedAt,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,

        user: updatedOrder.User
          ? {
              id: updatedOrder.User.id,
              name: updatedOrder.User.name,
              email: updatedOrder.User.email,
              phone: updatedOrder.User.phone,
            }
          : null,

        items: updatedOrder.OrderItem.map(
          (item: { id: any; orderId: any; productId: any; quantity: any; price: any; Product: { id: any; slug: any; name: any; category: any; description: any; image: any; imagesJson: any; colorsJson: any; sizesJson: any; price: any; compareAtPrice: any; stock: any; rating: any; reviewCount: any; isNew: any; isFeatured: any; inStock: any; createdAt: any; updatedAt: any; }; }) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,

            product: item.Product
              ? {
                  id: item.Product.id,
                  slug: item.Product.slug,
                  name: item.Product.name,
                  category:
                    item.Product.category,
                  description:
                    item.Product.description,
                  image: item.Product.image,
                  imagesJson:
                    item.Product.imagesJson,
                  colorsJson:
                    item.Product.colorsJson,
                  sizesJson:
                    item.Product.sizesJson,
                  price: item.Product.price,
                  compareAtPrice:
                    item.Product.compareAtPrice,
                  stock: item.Product.stock,
                  rating: item.Product.rating,
                  reviewCount:
                    item.Product.reviewCount,
                  isNew: item.Product.isNew,
                  isFeatured:
                    item.Product.isFeatured,
                  inStock:
                    item.Product.inStock,
                  createdAt:
                    item.Product.createdAt,
                  updatedAt:
                    item.Product.updatedAt,
                }
              : null,
          })
        ),
      };

      return NextResponse.json({
        success: true,
        message:
          "Payment approved successfully.",
        order: formattedOrder,
      });
    }

    /*
     * REJECT PAYMENT
     */
    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },
        data: {
          paymentStatus: "REJECTED",
          paymentConfirmedAt: null,
          status: "PENDING_PAYMENT",
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

    const formattedOrder = {
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      total: updatedOrder.total,
      status: updatedOrder.status,
      paymentMethod:
        updatedOrder.paymentMethod,
      paymentStatus:
        updatedOrder.paymentStatus,
      paymentReference:
        updatedOrder.paymentReference,
      paymentConfirmedAt:
        updatedOrder.paymentConfirmedAt,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,

      user: updatedOrder.User
        ? {
            id: updatedOrder.User.id,
            name: updatedOrder.User.name,
            email: updatedOrder.User.email,
            phone: updatedOrder.User.phone,
          }
        : null,

      items: updatedOrder.OrderItem.map(
        (item: { id: any; orderId: any; productId: any; quantity: any; price: any; Product: { id: any; slug: any; name: any; category: any; description: any; image: any; imagesJson: any; colorsJson: any; sizesJson: any; price: any; compareAtPrice: any; stock: any; rating: any; reviewCount: any; isNew: any; isFeatured: any; inStock: any; createdAt: any; updatedAt: any; }; }) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,

          product: item.Product
            ? {
                id: item.Product.id,
                slug: item.Product.slug,
                name: item.Product.name,
                category:
                  item.Product.category,
                description:
                  item.Product.description,
                image: item.Product.image,
                imagesJson:
                  item.Product.imagesJson,
                colorsJson:
                  item.Product.colorsJson,
                sizesJson:
                  item.Product.sizesJson,
                price: item.Product.price,
                compareAtPrice:
                  item.Product.compareAtPrice,
                stock: item.Product.stock,
                rating: item.Product.rating,
                reviewCount:
                  item.Product.reviewCount,
                isNew: item.Product.isNew,
                isFeatured:
                  item.Product.isFeatured,
                inStock:
                  item.Product.inStock,
                createdAt:
                  item.Product.createdAt,
                updatedAt:
                  item.Product.updatedAt,
              }
            : null,
        })
      ),
    };

    return NextResponse.json({
      success: true,
      message:
        "Payment rejected successfully.",
      order: formattedOrder,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update payment.",
      },
      { status: 500 }
    );
  }
}