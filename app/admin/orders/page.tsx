"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";
import { FileText, Clock, DollarSign, RefreshCw } from "lucide-react";
import {
  type Submission,
  type SubmissionStatus,
  type DashboardStats,
} from "@/lib/db/types";
import { getDummyOrders } from "@/lib/dummy-data";
import { formatCurrency } from "@/lib/utils";

type TabType = "open" | "closed";

const OPEN_STATUSES: SubmissionStatus[] = ["pending", "in_progress", "review", "completed"];
const CLOSED_STATUSES: SubmissionStatus[] = ["delivered", "refunded"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Submission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("open");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      // Filter by tab
      const statuses = activeTab === "open" ? OPEN_STATUSES : CLOSED_STATUSES;
      params.set("statuses", statuses.join(","));

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        // Fall back to dummy data if API fails
        const dummyOrders = getDummyOrders();
        const filteredOrders = dummyOrders.filter((o) =>
          statuses.includes(o.status)
        );
        setOrders(filteredOrders);
        setTotal(filteredOrders.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      // Fall back to dummy data
      const dummyOrders = getDummyOrders();
      const statuses = activeTab === "open" ? OPEN_STATUSES : CLOSED_STATUSES;
      const filteredOrders = dummyOrders.filter((o) =>
        statuses.includes(o.status)
      );
      setOrders(filteredOrders);
      setTotal(filteredOrders.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStats(), fetchOrders()]);
  }, [fetchStats, fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchOrders()]);
    setIsRefreshing(false);
  };

  const handleStatusChange = async (id: string, status: SubmissionStatus) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        // If status changed to a different tab, remove from current view
        const isNowOpen = OPEN_STATUSES.includes(status);
        const isCurrentlyOpen = activeTab === "open";

        if (isNowOpen !== isCurrentlyOpen) {
          setOrders((prev) => prev.filter((o) => o.id !== id));
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
          );
        }
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <AdminShell
      title="Orders"
      actions={
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Orders"
          value={stats?.total_submissions ?? "-"}
          icon={FileText}
        />
        <StatsCard
          title="Pending"
          value={stats?.pending_count ?? "-"}
          icon={Clock}
        />
        <StatsCard
          title="Revenue"
          value={stats ? formatCurrency(stats.total_revenue) : "-"}
          icon={DollarSign}
        />
      </div>

      {/* Tabs */}
      <AdminTabs
        tabs={[
          { id: "open", label: "Open" },
          { id: "closed", label: "Closed" },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as TabType)}
      />

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </AdminShell>
  );
}
