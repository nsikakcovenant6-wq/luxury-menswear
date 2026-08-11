import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token) as { id: string } | null;

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const measurement = await prisma.measurement.findFirst({
      where: {
        userId: payload.id,
      },
    });

    return NextResponse.json({
      success: true,
      measurement,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token) as { id: string } | null;

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const measurement = await prisma.measurement.create({
      data: {
        userId: payload.id,
        height: body.height,
        chest: body.chest,
        waist: body.waist,
        neck: body.neck,
        shoulder: body.shoulder,
        sleeve: body.sleeve,
        trouser: body.trouser,
      },
    });

    return NextResponse.json({
      success: true,
      measurement,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save measurements.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token) as { id: string } | null;

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const measurement = await prisma.measurement.findFirst({
      where: {
        userId: payload.id,
      },
    });

    if (!measurement) {
      return NextResponse.json(
        {
          success: false,
          message: "Measurement not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updated = await prisma.measurement.update({
      where: {
        id: measurement.id,
      },
      data: body,
    });

    return NextResponse.json({
      success: true,
      measurement: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update measurements.",
      },
      {
        status: 500,
      }
    );
  }
}