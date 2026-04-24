"use client";
// src/app/admin/page.tsx — Admin: view + manage all complaints

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Calendar, User2, Inbox } from "lucide-react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { Complaint, ComplaintStatus } from "@/types";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES: (ComplaintStatus | "All")[] = ["All", "Pending", "In Progress", "Resolved"];

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComplaintStatus | "All">("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Guard
  useEffect(() => {
    if (!user) router.push("/auth/login");
    else if (user.role !== "admin") router.push("/dashboard");
  }, [user, router]);

  // Fetch all complaints
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const fetch = async () => {
      setLoading(true);
      try {
        const params = filter !== "All" ? { status: filter } : {};
        const res = await api.get("/complaints/all", { params });
        setComplaints(res.data.data.complaints);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, filter]);

  // Update status
  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/complaints/${id}`, { status });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: res.data.data.complaint.status } : c))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getUserEmail = (c: Complaint) => {
    if (typeof c.userId === "object" && "email" in c.userId) return c.userId.email;
    return "Unknown";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage all complaints from all users</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: counts.total, color: "text-foreground", bg: "bg-muted" },
            { label: "Pending", value: counts.pending, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "In Progress", value: counts.inProgress, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Resolved", value: counts.resolved, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-border rounded-xl p-4`}>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
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

        {/* Complaints */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No complaints found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {filter !== "All" ? `No ${filter} complaints` : "No complaints have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <Card
                key={c._id}
                className={`transition-all ${updatingId === c._id ? "opacity-60" : "hover:border-primary/30"}`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-foreground font-semibold">{c.title}</h3>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                        {c.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User2 className="w-3.5 h-3.5" />
                          {getUserEmail(c)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right — Status dropdown */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-muted-foreground text-xs hidden sm:block">Update:</span>
                      <Select
                        value={c.status}
                        onValueChange={(val) => handleStatusChange(c._id, val as ComplaintStatus)}
                        disabled={updatingId === c._id}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
