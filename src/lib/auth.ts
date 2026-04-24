// src/lib/auth.ts
// JWT sign and verify helpers used by API routes

import jwt from "jsonwebtoken";
import { AuthUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

// Extract token from Authorization header: "Bearer <token>"
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}
