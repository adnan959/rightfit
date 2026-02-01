"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  type Submission,
  type SubmissionStatus,
} from "@/lib/db/types";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Clock,
  AlertCircle,
} from "lucide-react";

interface SubmissionsTableProps {
  submissions: Submission[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: SubmissionStatus) => void;
  isLoading?: boolean;
}

export function SubmissionsTable({
  submissions,
  total,
  page,
  totalPages,
  onPageChange,
  onStatusChange,
  isLoading,
}: SubmissionsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: SubmissionStatus) => {
    setUpdatingId(id);
    await onStatusChange(id, status);
    setUpdatingId(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">No submissions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Target Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Submitted
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">
                      {submission.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {submission.email}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm text-foreground">
                    {submission.job_titles}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {submission.location}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Select
                    value={submission.status}
                    onValueChange={(value) =>
                      handleStatusChange(submission.id, value as SubmissionStatus)
                    }
                    disabled={updatingId === submission.id}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        <Badge
                          className={STATUS_COLORS[submission.status]}
                          variant="secondary"
                        >
                          {STATUS_LABELS[submission.status]}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge
                    className={PRIORITY_COLORS[submission.priority]}
                    variant="secondary"
                  >
                    {submission.priority}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1.5 h-4 w-4" />
                    {formatDistanceToNow(submission.created_at)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/submissions/${submission.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
        <div className="text-xs text-muted-foreground sm:text-sm">
          {submissions.length} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground sm:text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
