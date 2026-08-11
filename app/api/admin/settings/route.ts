import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/admin";

const SETTINGS_ID = "store";

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

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

    const settings = await prisma.storeSettings.upsert({
      where: {
        id: SETTINGS_ID,
      },
      update: {},
      create: {
        id: SETTINGS_ID,
        storeName: "Benkaso Collection",
        bankName: "",
        accountName: "",
        accountNumber: "",
        whatsappNumber: "",
        whatsappMessage:
          "Hello Benkaso Collection, I would like to make an inquiry.",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store settings.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid settings data.",
        },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const storeName =
      cleanString(data.storeName) || "Benkaso Collection";

    const bankName = cleanString(data.bankName);
    const accountName = cleanString(data.accountName);
    const accountNumber = cleanString(data.accountNumber);

    const whatsappNumber = cleanString(
      data.whatsappNumber
    );

    const whatsappMessage =
      cleanString(data.whatsappMessage) ||
      "Hello Benkaso Collection, I would like to make an inquiry.";

    if (!bankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank name is required.",
        },
        { status: 400 }
      );
    }

    if (!accountName) {
      return NextResponse.json(
        {
          success: false,
          message: "Account name is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Account number must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    if (whatsappNumber) {
      const normalizedWhatsapp = whatsappNumber.replace(
        /\D/g,
        ""
      );

      if (
        normalizedWhatsapp.length < 10 ||
        normalizedWhatsapp.length > 15
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "WhatsApp number must contain between 10 and 15 digits.",
          },
          { status: 400 }
        );
      }
    }

    const settings = await prisma.storeSettings.upsert({
      where: {
        id: SETTINGS_ID,
      },

      update: {
        storeName,
        bankName,
        accountName,
        accountNumber,
        whatsappNumber: whatsappNumber
          ? whatsappNumber.replace(/\D/g, "")
          : "",
        whatsappMessage,
        updatedAt: new Date(),
      },

      create: {
        id: SETTINGS_ID,
        storeName,
        bankName,
        accountName,
        accountNumber,
        whatsappNumber: whatsappNumber
          ? whatsappNumber.replace(/\D/g, "")
          : "",
        whatsappMessage,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Store settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save store settings.",
      },
      { status: 500 }
    );
  }
}