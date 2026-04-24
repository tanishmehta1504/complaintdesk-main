// src/app/api/complaints/[id]/route.ts
// PUT /api/complaints/:id — Admin only: update complaint status

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Complaint from "@/models/Complaint";
import { verifyToken, extractToken } from "@/lib/auth";
import { updateStatusSchema } from "@/lib/validators";
import logger from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied: Admins only" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();

    // Validate status with Zod
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findByIdAndUpdate(
      params.id,
      { status: result.data.status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: "Complaint not found" },
        { status: 404 }
      );
    }

    logger.info(
      `Admin ${user.email} updated complaint ${params.id} → ${result.data.status}`
    );

    return NextResponse.json({
      success: true,
      message: "Status updated successfully!",
      data: { complaint },
    });
  } catch (error) {
    logger.error(`PUT /api/complaints/${params.id} error: ${error}`);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
