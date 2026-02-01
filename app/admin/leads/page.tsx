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
  Users,
  UserCheck,
  Mail,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { formatDateTime, formatDistanceToNow } from "@/lib/utils";
import type { Lead, LeadSource } from "@/lib/db/types";

interface LeadDisplay extends Lead {
  // For JSON format compatibility
  timestamp?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  audit_modal: "Free Audit",
  form_abandon: "Form Abandon",
  direct: "Direct",
  free_audit: "Free Audit",
  newsletter: "Newsletter",
  other: "Other",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadDisplay[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    conversionRate: 0,
  });

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (filter === "converted") {
        params.set("converted", "true");
      } else if (filter === "not_converted") {
        params.set("converted", "false");
      }

      const response = await fetch(`/api/admin/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);

        // Calculate stats from total
        const convertedCount = data.leads?.filter(
          (l: LeadDisplay) => l.converted
        ).length || 0;
        setStats({
          total: data.total || 0,
          converted: convertedCount,
          conversionRate:
            data.total > 0
              ? Math.round((convertedCount / data.total) * 100)
              : 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchLeads();
  }, [fetchLeads]);

  const handleMarkConverted = async (leadId: string) => {
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, converted: true }),
      });

      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to mark lead as converted:", error);
    }
  };

  return (
    <AdminShell
      title="Leads"
    >
      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Leads"
          value={stats.total}
          icon={Users}
        />
        <StatsCard
          title="Converted"
          value={stats.converted}
          description="Became paying customers"
          icon={UserCheck}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={Mail}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">All Leads</h2>
        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            <SelectItem value="not_converted">Not Converted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2">No leads found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Captured
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center text-primary hover:underline"
                          >
                            {lead.email}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">
                            {SOURCE_LABELS[lead.source] || lead.source}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {lead.converted ? (
                            <Badge className="bg-green-100 text-green-800">
                              Converted
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">
                              Not Converted
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(
                            lead.created_at || lead.timestamp || ""
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {!lead.converted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkConverted(lead.id)}
                            >
                              Mark Converted
                            </Button>
                          )}
                          {lead.converted && lead.converted_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(lead.converted_at)}
                            </span>
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
                  {leads.length} of {total}
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
