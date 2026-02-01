"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  CheckCircle,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  type SubmissionWithRelations,
  type SubmissionStatus,
} from "@/lib/db/types";
import { formatDateTime, formatDistanceToNow } from "@/lib/utils";
import { getDummyOrderById, getCVVersions, type CVVersion } from "@/lib/dummy-data";
import { CustomerCard } from "@/components/admin/CustomerCard";
import { SubmissionCard } from "@/components/admin/SubmissionCard";
import { FilesSection } from "@/components/admin/FilesSection";
import { OrderActions } from "@/components/admin/OrderActions";
import { TimelineCard, TimelineSection, TimelineEnd } from "@/components/admin/TimelineEvent";

// Chronological Flow Component - integrates timeline throughout with cards
function ChronologicalFlow({
  order,
  cvVersions,
  onVersionsChange,
  onDelivery,
}: {
  order: SubmissionWithRelations;
  cvVersions: CVVersion[];
  onVersionsChange: (versions: CVVersion[]) => void;
  onDelivery: () => void;
}) {
  // Sort activity log by date (oldest first for chronological display)
  const sortedActivities = [...(order.activity_log || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Find key events
  const orderSubmitted = sortedActivities.find((a) =>
    a.action.toLowerCase().includes("order submitted")
  );
  const paymentReceived = sortedActivities.find((a) =>
    a.action.toLowerCase().includes("payment received")
  );
  const aiGradeCompleted = sortedActivities.find((a) =>
    a.action.toLowerCase().includes("ai grade")
  );

  // Get events after AI grade (workflow events)
  const aiGradeIndex = sortedActivities.findIndex((a) =>
    a.action.toLowerCase().includes("ai grade")
  );
  const workflowEvents = aiGradeIndex >= 0 
    ? sortedActivities.slice(aiGradeIndex + 1) 
    : [];

  // Get AI grade data for display
  const aiGrade = order.ai_grades?.[0];

  return (
    <div className="relative">
      {/* Order Submitted - Card */}
      {orderSubmitted && (
        <TimelineCard
          title="Order Submitted"
          description={orderSubmitted.description}
          timestamp={orderSubmitted.created_at}
          actor={orderSubmitted.actor}
          isFirst={true}
        />
      )}

      {/* Payment Received - Card */}
      {paymentReceived && (
        <TimelineCard
          title="Payment Received"
          description={paymentReceived.description}
          timestamp={paymentReceived.created_at}
          actor={paymentReceived.actor}
          metadata={paymentReceived.metadata}
          rightContent={
            <Badge className="bg-green-100 text-green-700">
              ${((paymentReceived.metadata?.amount as number) / 100 || 30).toFixed(2)} Paid
            </Badge>
          }
        />
      )}

      {/* AI Grade Completed - Card */}
      {aiGradeCompleted && (
        <TimelineCard
          title="AI Grade Completed"
          description={aiGrade ? `${aiGrade.label} - ${aiGrade.top_issues?.[0] || "Analysis complete"}` : aiGradeCompleted.description}
          timestamp={aiGradeCompleted.created_at}
          actor={aiGradeCompleted.actor}
          rightContent={
            aiGrade && (
              <Badge 
                className={
                  aiGrade.overall_score >= 70
                    ? "bg-green-100 text-green-700"
                    : aiGrade.overall_score >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {aiGrade.overall_score}/100
              </Badge>
            )
          }
        />
      )}

      {/* Submission Details - Full Card */}
      <TimelineSection title="Submission Details">
        <SubmissionCard order={order} />
      </TimelineSection>

      {/* Workflow Events (status changes, notes, CV uploads, etc.) */}
      {workflowEvents.map((activity) => (
        <TimelineCard
          key={activity.id}
          title={activity.action}
          description={activity.description}
          timestamp={activity.created_at}
          actor={activity.actor}
          metadata={activity.metadata}
        />
      ))}

      {/* Delivery Section - Full Card (Final Step) */}
      <TimelineSection 
        title="Delivery" 
        isLast={["delivered", "completed", "refunded"].includes(order.status)}
      >
        <FilesSection
          order={order}
          cvVersions={cvVersions}
          onVersionsChange={onVersionsChange}
          onDelivery={onDelivery}
        />
      </TimelineSection>

      {/* End marker based on status */}
      {["delivered", "completed", "refunded"].includes(order.status) ? (
        <TimelineEnd 
          status={order.status as "delivered" | "completed" | "refunded"} 
          timestamp={order.delivered_at || order.completed_at || order.updated_at}
        />
      ) : (
        <TimelineEnd status="in_progress" />
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<SubmissionWithRelations | null>(null);
  const [cvVersions, setCvVersions] = useState<CVVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      // Try API first
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
        setCvVersions(getCVVersions(id));
      } else {
        // Fall back to dummy data
        const dummyOrder = getDummyOrderById(id);
        if (dummyOrder) {
          setOrder(dummyOrder);
          setCvVersions(getCVVersions(id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      // Fall back to dummy data
      const dummyOrder = getDummyOrderById(id);
      if (dummyOrder) {
        setOrder(dummyOrder);
        setCvVersions(getCVVersions(id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (status: SubmissionStatus) => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleCloseOrder = () => {
    handleStatusChange("delivered");
  };

  const handleRefund = (reason: string) => {
    handleStatusChange("refunded");
    setShowRefundModal(false);
  };

  if (isLoading) {
    return (
      <AdminShell hideHeader>
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading order...</div>
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell hideHeader>
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-500">Order not found</p>
          <Link href="/admin/orders">
            <Button variant="link" className="mt-4">
              Back to Orders
            </Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const payment = order.payments?.[0];
  const isClosed = order.status === "delivered" || order.status === "refunded";

  return (
    <AdminShell hideHeader>
      {/* Header */}
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/orders")}
              className="-ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-5 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Order #{id.slice(0, 8)}
              </h1>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(order.created_at)} ({formatDistanceToNow(order.created_at)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSendMessage(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRequestInfo(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Info
                </DropdownMenuItem>
                {order.status === "delivered" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Request Revision
                    </DropdownMenuItem>
                  </>
                )}
                {order.status !== "refunded" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowRefundModal(true)}
                      className="text-red-600"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Refund Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Close Order Button */}
            {!isClosed && (
              <Button size="sm" onClick={handleCloseOrder}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Close Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex gap-4">
        {/* Left Column - Chronological Flow */}
        <div className="flex-1 min-w-0">
          <ChronologicalFlow
            order={order}
            cvVersions={cvVersions}
            onVersionsChange={setCvVersions}
            onDelivery={handleCloseOrder}
          />
        </div>

        {/* Right Sidebar - Customer Info */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-4">
            <CustomerCard order={order} payment={payment} />
          </div>
        </div>
      </div>

      {/* Mobile Customer Card - Shows below on smaller screens */}
      <div className="mt-4 lg:hidden">
        <CustomerCard order={order} payment={payment} />
      </div>

      {/* Action Modals */}
      <OrderActions
        order={order}
        showSendMessage={showSendMessage}
        setShowSendMessage={setShowSendMessage}
        showRequestInfo={showRequestInfo}
        setShowRequestInfo={setShowRequestInfo}
        showRefundModal={showRefundModal}
        setShowRefundModal={setShowRefundModal}
        onRefund={handleRefund}
      />
    </AdminShell>
  );
}
