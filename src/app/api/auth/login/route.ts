// src/app/api/auth/login/route.ts
// POST /api/auth/login — Login existing user

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate with Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user — explicitly select password (select:false in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: { id: user._id.toString(), email: user.email, role: user.role },
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
