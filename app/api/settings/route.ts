import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "store";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: {
        id: SETTINGS_ID,
      },
      select: {
        storeName: true,
        bankName: true,
        accountName: true,
        accountNumber: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "Store settings have not been configured.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store settings.",
      },
      { status: 500 }
    );
  }
}