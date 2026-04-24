"use client";
// src/app/submit/page.tsx — Submit a new complaint

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { createComplaintSchema, CreateComplaintInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";

export default function SubmitPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) router.push("/auth/login");
    else if (user.role === "admin") router.push("/admin");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
  });

  const titleLength = watch("title")?.length || 0;
  const descLength = watch("description")?.length || 0;

  const onSubmit = async (data: CreateComplaintInput) => {
    try {
      await api.post("/complaints", data);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to submit complaint.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            My Complaints
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">New Complaint</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Complaint</CardTitle>
            <CardDescription>
              Describe your issue clearly. An admin will review and update the status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success state */}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Complaint submitted successfully!</p>
                  <p className="text-emerald-500 text-xs mt-0.5">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Complaint Title <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">{titleLength}/100</span>
                </div>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  maxLength={100}
                  disabled={success}
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <span className="text-xs text-muted-foreground">{descLength}/1000</span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe your complaint in detail. Include any relevant context or information..."
                  rows={6}
                  maxLength={1000}
                  disabled={success}
                  {...register("description")}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2.5 bg-muted/50 border border-border rounded-lg p-3">
                <span className="text-muted-foreground text-sm mt-0.5">ℹ️</span>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Your complaint will start as{" "}
                  <span className="text-amber-400 font-medium">Pending</span>. An admin will review it
                  and update the status accordingly.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting || success} className="flex-1 gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Complaint</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
