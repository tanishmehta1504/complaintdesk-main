"use client";
// src/app/dashboard/page.tsx — User: view own complaints

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Calendar, Inbox } from "lucide-react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { Complaint, ComplaintStatus } from "@/types";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUSES: (ComplaintStatus | "All")[] = ["All", "Pending", "In Progress", "Resolved"];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | "All">("All");

  // Guard — redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/auth/login");
    else if (user.role === "admin") router.push("/admin");
  }, [user, router]);

  // Fetch complaints
  useEffect(() => {
    if (!user) return;
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params = filter !== "All" ? { status: filter } : {};
        const res = await api.get("/complaints", { params });
        setComplaints(res.data.data.complaints);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user, filter]);

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome back, <span className="text-primary">{user?.email}</span>
            </p>
          </div>
          <Link href="/submit">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> New Complaint
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: counts.total, color: "text-foreground", bg: "bg-muted" },
            { label: "Pending", value: counts.pending, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "In Progress", value: counts.inProgress, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Resolved", value: counts.resolved, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border border-border rounded-xl p-4`}>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-muted-foreground text-sm">Filter:</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Complaints list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No complaints found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {filter !== "All" ? `No ${filter} complaints` : "Submit your first complaint to get started"}
            </p>
            <Link href="/submit">
              <Button variant="outline" className="mt-4">Submit a complaint</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <Card key={c._id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-foreground font-semibold">{c.title}</h3>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-border">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      Submitted {formatDate(c.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
