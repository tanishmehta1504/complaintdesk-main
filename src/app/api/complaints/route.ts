// src/app/api/complaints/route.ts
// GET  /api/complaints — get current user's complaints
// POST /api/complaints — submit a new complaint

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Complaint from "@/models/Complaint";
import { verifyToken, extractToken } from "@/lib/auth";
import { createComplaintSchema } from "@/lib/validators";
import logger from "@/lib/logger";

// ── GET — fetch complaints for the logged-in user ─────────────
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Optional status filter: /api/complaints?status=Pending
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { userId: user.id };
    if (status && ["Pending", "In Progress", "Resolved"].includes(status)) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Complaints fetched",
      data: { complaints, total: complaints.length },
    });
  } catch (error) {
    logger.error(`GET /api/complaints error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ── POST — submit a new complaint ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    // Validate with Zod
    const result = createComplaintSchema.safeParse(body);
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

    const complaint = await Complaint.create({
      userId: user.id,
      title: result.data.title,
      description: result.data.description,
    });

    logger.info(`Complaint submitted by ${user.email}: ${complaint._id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Complaint submitted successfully!",
        data: { complaint },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(`POST /api/complaints error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
