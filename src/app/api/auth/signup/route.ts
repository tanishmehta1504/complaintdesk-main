// src/app/api/auth/signup/route.ts
// POST /api/auth/signup — Register a new user

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate with Zod
    const result = signupSchema.safeParse(body);
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

    const { email, password, role } = result.data;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered. Please login." },
        { status: 409 }
      );
    }

    // Create user — password is hashed by pre-save hook
    const user = await User.create({ email, password, role });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`New user registered: ${email} (${role})`);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully!",
        data: {
          token,
          user: { id: user._id.toString(), email: user.email, role: user.role },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(`Signup error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
