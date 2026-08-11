import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        price: true,
        stock: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("AI products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load products.",
      },
      {
        status: 500,
      }
    );
  }
}