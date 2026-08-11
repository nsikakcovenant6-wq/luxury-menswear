import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "store";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: {
        id: SETTINGS_ID,
      },

      update: {},

      create: {
        id: SETTINGS_ID,
        storeName: "Benkaso Collection",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        settings: {
          storeName: settings.storeName,
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          whatsappNumber: settings.whatsappNumber,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/store-settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store settings.",
      },
      { status: 500 }
    );
  }
}