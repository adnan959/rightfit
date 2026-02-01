"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  CreditCard,
  RefreshCcw,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { DashboardStats, PaymentStatus } from "@/lib/db/types";

interface PaymentWithSubmission {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  submission_id: string | null;
  stripe_payment_intent_id: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  submissions?: {
    full_name: string;
    email: string;
  } | null;
}

export default function BillingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payments, setPayments] = useState<PaymentWithSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/admin/payments?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchPayments()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchStats, fetchPayments]);

  const handleMarkPaid = async (paymentId: string) => {
    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, status: "paid" }),
      });

      if (response.ok) {
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to mark payment as paid:", error);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      refunded: "bg-red-100 text-red-800",
      failed: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <AdminShell
      title="Billing"
    >
      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.total_revenue) : "-"}
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Payments"
          value={stats ? formatCurrency(stats.pending_revenue) : "-"}
          icon={CreditCard}
        />
        <StatsCard
          title="Avg. Order Value"
          value="$30"
          description="Fixed pricing"
          icon={TrendingUp}
        />
        <StatsCard
          title="Completed Orders"
          value={stats?.total_submissions ?? "-"}
          icon={RefreshCcw}
        />
      </div>

      {/* Stripe Integration Notice */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-4 py-4">
          <AlertCircle className="h-6 w-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">
              Stripe Integration Coming Soon
            </p>
            <p className="text-sm text-amber-700">
              Currently using manual invoicing. Payments shown here are manually
              recorded.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Payment History</h2>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <CreditCard className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2">No payments found</p>
              <p className="text-sm">
                Payments will appear here once Supabase is configured
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4">
                          {payment.submissions ? (
                            <div>
                              <p className="font-medium text-foreground">
                                {payment.submissions.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.submissions.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-foreground">
                            {formatCurrency(payment.amount)}
                          </span>
                          {payment.refund_amount && (
                            <span className="ml-2 text-sm text-red-600">
                              (-{formatCurrency(payment.refund_amount)})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(payment.status)}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {formatDateTime(payment.created_at)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {payment.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(payment.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                <span className="text-xs text-muted-foreground sm:text-sm">
                  {payments.length} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
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
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
