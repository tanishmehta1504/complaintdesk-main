// src/components/StatusBadge.tsx
// Color-coded status badge component

import { Badge } from "@/components/ui/badge";
import { ComplaintStatus } from "@/types";

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<ComplaintStatus, "pending" | "inprogress" | "resolved"> = {
    Pending: "pending",
    "In Progress": "inprogress",
    Resolved: "resolved",
  };

  const dotMap: Record<ComplaintStatus, string> = {
    Pending: "bg-amber-400",
    "In Progress": "bg-blue-400",
    Resolved: "bg-emerald-400",
  };

  return (
    <Badge variant={variantMap[status]} className="gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status]}`} />
      {status}
    </Badge>
  );
}
