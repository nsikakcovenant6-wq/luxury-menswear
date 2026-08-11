import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function getAdminFromRequest(
  req: NextRequest
) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    const userId =
      payload.userId ?? payload.id;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.role !== "ADMIN") {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error
    );

    return null;
  }
}