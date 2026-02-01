"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Briefcase,
  MoreHorizontal,
  Eye,
  Send,
  CheckCircle,
} from "lucide-react";
import { type Submission, type SubmissionStatus } from "@/lib/db/types";
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
  if (order.status === "refunded") {
    return { label: "Refunded", color: "bg-red-100 text-red-700" };
  }
  return { label: "Paid", color: "bg-green-100 text-green-700" };
}

function OrderCard({ order, onStatusChange }: { order: Submission; onStatusChange: (id: string, status: SubmissionStatus) => void }) {
  const payment = getPaymentStatus(order);
  
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {/* Avatar/Icon */}
      <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
        <User className="h-5 w-5 text-primary" />
      </div>
      
      {/* Main content */}
      <Link href={`/admin/orders/${order.id}`} className="min-w-0 flex-1">
        {/* Top row: Name + badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground group-hover:text-primary">
            {order.full_name}
          </span>
          <Badge className={payment.color} variant="secondary">
            {payment.label}
          </Badge>
        </div>
        
        {/* Bottom row: Role + Email + Time (all inline) */}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{order.job_titles}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <span className="truncate">{order.email}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-xs whitespace-nowrap">{formatDistanceToNow(order.created_at)}</span>
        </div>
      </Link>
      
      {/* Ellipsis Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/orders/${order.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </DropdownMenuItem>
          {order.status !== "delivered" && order.status !== "refunded" && (
            <DropdownMenuItem onClick={() => onStatusChange(order.id, "delivered")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Delivered
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
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
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-card">
        <FileText className="h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Order cards */}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
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
      )}
    </div>
  );
}
