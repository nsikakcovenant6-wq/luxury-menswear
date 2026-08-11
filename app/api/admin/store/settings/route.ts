import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "store";

export async function GET() {
  try {
    const settings =
      await prisma.storeSettings.findUnique({
        where: {
          id: SETTINGS_ID,
        },
        select: {
          storeName: true,
          bankName: true,
          accountName: true,
          accountNumber: true,
          whatsappNumber: true,
          whatsappMessage: true,
        },
      });

    return NextResponse.json({
      success: true,
      settings: settings || {
        storeName: "Benkaso Collection",
        bankName: null,
        accountName: null,
        accountNumber: null,
        whatsappNumber: null,
        whatsappMessage:
          "Hello Benkaso Collection, I would like to make an inquiry.",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/store/settings error:",
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