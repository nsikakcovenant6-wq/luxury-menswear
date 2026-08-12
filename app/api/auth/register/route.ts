import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  createAuthToken,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const message =
        result.error.issues?.[0]?.message ??
        "Invalid input.";

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
    } = result.data;

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // Check if email already exists
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword =
      await hashPassword(password);

    const now = new Date();

    // Create user
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),

        name: name.trim(),

        email: normalizedEmail,

        password: hashedPassword,

        updatedAt: now,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    // Create authentication token
    const token = createAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );

    // Set authentication cookie
    response.cookies.set("token", token, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 24 * 7,

      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}