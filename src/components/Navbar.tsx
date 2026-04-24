"use client";
// src/components/Navbar.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut, ClipboardList, LayoutDashboard, PlusCircle, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user?.role === "admin" ? "/admin" : "/dashboard"}
          className="flex items-center gap-2 font-bold text-lg text-foreground"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-primary-foreground" />
          </div>
          ComplaintDesk
        </Link>

        {/* Nav links + user info */}
        {user && (
          <div className="flex items-center gap-2">
            {user.role === "admin" ? (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Submit
                  </Button>
                </Link>
              </>
            )}

            {/* User email badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {user.email}
              {user.role === "admin" && (
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
