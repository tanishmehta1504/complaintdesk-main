// src/app/api/complaints/all/route.ts
// GET /api/complaints/all — Admin only: fetch every complaint from all users

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Complaint from "@/models/Complaint";
import { verifyToken, extractToken } from "@/lib/auth";
import logger from "@/lib/logger";

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

    // Only admins can access this endpoint
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    await connectDB();

    // Optional status filter: /api/complaints/all?status=Pending
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status && ["Pending", "In Progress", "Resolved"].includes(status)) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate("userId", "email role") // Show submitter email to admin
      .sort({ createdAt: -1 })
      .lean();

    logger.info(`Admin ${user.email} fetched all complaints`);

    return NextResponse.json({
      success: true,
      message: "All complaints fetched",
      data: { complaints, total: complaints.length },
    });
  } catch (error) {
    logger.error(`GET /api/complaints/all error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
