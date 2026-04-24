// src/types/index.ts
// All shared TypeScript types for the entire application

export type UserRole = "user" | "admin";
export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";

// ── Auth ──────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (val: boolean) => void;
}

// ── Complaint ─────────────────────────────────────────────────
export interface Complaint {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        email: string;
      };
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

// ── API Response ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}
