"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Eye,
  Send,
  MessageSquare,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import {
  type Submission,
  type SubmissionStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/db/types";
import { formatDistanceToNow } from "@/lib/utils";

interface OrdersTableProps {
  orders: Submission[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: SubmissionStatus) => void;
  isLoading: boolean;
}

function getPaymentStatus(order: Submission): { label: string; color: string } {
  // Check if order has payment info (we'll infer from status for now)
  if (order.status === "refunded") {
    return { label: "Refunded", color: "bg-red-100 text-red-700" };
  }
  // For dummy data, assume all non-refunded orders are paid
  return { label: "Paid", color: "bg-green-100 text-green-700" };
}

export function OrdersTable({
  orders,
  total,
  page,
  totalPages,
  onPageChange,
  onStatusChange,
  isLoading,
}: OrdersTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-gray-500">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Target Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Submitted
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => {
                const payment = getPaymentStatus(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="group block"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-coral-600">
                          {order.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {order.job_titles}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.industries.slice(0, 2).join(", ")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge
                        className={STATUS_COLORS[order.status]}
                        variant="secondary"
                      >
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={payment.color} variant="secondary">
                        {payment.label}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(order.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/orders/${order.id}?action=message`)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/orders/${order.id}?action=request-info`)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Request Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.status !== "delivered" && order.status !== "refunded" && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(order.id, "delivered")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Close Order
                            </DropdownMenuItem>
                          )}
                          {order.status !== "refunded" && (
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/${order.id}?action=refund`)}
                              className="text-red-600"
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Refund Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-500">
              Showing {orders.length} of {total} orders
            </span>
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
        )}
      </CardContent>
    </Card>
  );
}
