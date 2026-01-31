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
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-500">No submissions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Target Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {submission.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.email}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {submission.job_titles}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.location}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
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
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge
                    className={PRIORITY_COLORS[submission.priority]}
                    variant="secondary"
                  >
                    {submission.priority}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1.5 h-4 w-4" />
                    {formatDistanceToNow(submission.created_at)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
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
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
        <div className="text-sm text-gray-500">
          Showing {submissions.length} of {total} submissions
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
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
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
