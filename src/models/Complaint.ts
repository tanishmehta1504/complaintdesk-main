// src/models/Complaint.ts
// Mongoose Complaint schema

import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IComplaint extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Prevent model re-registration in Next.js hot reload
const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", complaintSchema);

export default Complaint;
