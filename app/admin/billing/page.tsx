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
      failed: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <AdminShell
      title="Billing"
      description="Revenue overview and payment management"
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
      <div className="mb-6 flex items-center justify-between">
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
            <div className="flex h-32 items-center justify-center text-gray-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500">
              <CreditCard className="h-8 w-8 text-gray-300" />
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
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Customer
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="py-4">
                          {payment.submissions ? (
                            <div>
                              <p className="font-medium">
                                {payment.submissions.full_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {payment.submissions.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="font-medium">
                            {formatCurrency(payment.amount)}
                          </span>
                          {payment.refund_amount && (
                            <span className="ml-2 text-sm text-red-600">
                              (-{formatCurrency(payment.refund_amount)})
                            </span>
                          )}
                        </td>
                        <td className="py-4">{getStatusBadge(payment.status)}</td>
                        <td className="py-4 text-sm text-gray-500">
                          {formatDateTime(payment.created_at)}
                        </td>
                        <td className="py-4 text-right">
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
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-sm text-gray-500">
                  Showing {payments.length} of {total} payments
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
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
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
