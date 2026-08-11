import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin";

export async function GET(req: NextRequest) {
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

    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,

        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customers.",
      },
      { status: 500 }
    );
  }
}