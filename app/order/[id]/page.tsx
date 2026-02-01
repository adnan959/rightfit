"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  Send,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { formatDateTime, formatDistanceToNow } from "@/lib/utils";

interface OrderData {
  id: string;
  status: string;
  fullName: string;
  email: string;
  jobTitles: string;
  industries: string[];
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  completedAt: string | null;
}

interface TimelineEvent {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
  actor: string;
}

interface InfoRequest {
  id: string;
  note_type: string;
  content: string;
  created_at: string;
}

const STATUS_INFO: Record<string, { label: string; description: string; color: string }> = {
  pending: {
    label: "Order Received",
    description: "We've received your order. Review begins shortly.",
    color: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "In Progress",
    description: "Your CV is being rewritten by our expert.",
    color: "bg-yellow-100 text-yellow-700",
  },
  review: {
    label: "Final Review",
    description: "Final review in progress. Almost there!",
    color: "bg-purple-100 text-purple-700",
  },
  completed: {
    label: "Ready",
    description: "Your CV is ready! Download it below.",
    color: "bg-green-100 text-green-700",
  },
  delivered: {
    label: "Delivered",
    description: "Your rewritten CV has been delivered.",
    color: "bg-green-100 text-green-700",
  },
  refunded: {
    label: "Refunded",
    description: "This order has been refunded.",
    color: "bg-red-100 text-red-700",
  },
};

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("token");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revision request state
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSubmitted, setRevisionSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const url = new URL(`/api/order/${id}`, window.location.origin);
      if (token) url.searchParams.set("token", token);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setDownloadUrl(data.downloadUrl);
        setTimeline(data.timeline || []);
        setInfoRequests(data.infoRequests || []);
      } else {
        setError(data.error || "Failed to load order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  const handleRevisionSubmit = async () => {
    if (!revisionText.trim()) return;

    setIsSubmittingRevision(true);
    try {
      const response = await fetch(`/api/order/${id}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          content: revisionText,
        }),
      });

      if (response.ok) {
        setRevisionSubmitted(true);
        setShowRevisionForm(false);
        setRevisionText("");
        // Refresh order data
        fetchOrder();
      } else {
        alert("Failed to submit revision request. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting revision:", err);
      alert("Failed to submit revision request. Please try again.");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find this order. Please check your link or try looking up your order."}
            </p>
            <Link href="/order/lookup">
              <Button>Look Up Order</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const canRequestRevision = ["completed", "delivered"].includes(order.status);
  const hasRevisionRequest = infoRequests.some((r) => r.note_type === "revision_request");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">ApplyBetter</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={fetchOrder}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Order #{id.slice(0, 8).toUpperCase()}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                Hi {order.fullName.split(" ")[0]}!
              </h1>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {["completed", "delivered"].includes(order.status) ? (
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              ) : (
                <Clock className="h-8 w-8 text-primary flex-shrink-0" />
              )}
              <div>
                <h2 className="text-lg font-semibold mb-1">{statusInfo.label}</h2>
                <p className="text-muted-foreground">{statusInfo.description}</p>
                {order.status === "pending" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Expected delivery: 48-96 hours from order time
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section - Only show when CV is ready */}
        {downloadUrl && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-green-800 mb-1">
                    Your Rewritten CV is Ready!
                  </h2>
                  <p className="text-green-700 text-sm mb-4">
                    Download your professionally rewritten CV below.
                  </p>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download CV
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Requests from Admin */}
        {infoRequests.filter((r) => r.note_type === "info_request").length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Information Requested
              </CardTitle>
            </CardHeader>
            <CardContent>
              {infoRequests
                .filter((r) => r.note_type === "info_request")
                .map((request) => (
                  <div key={request.id} className="mb-4 last:mb-0">
                    <p className="text-amber-800">{request.content}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {formatDistanceToNow(request.created_at)}
                    </p>
                  </div>
                ))}
              <p className="text-sm text-amber-700 mt-4">
                Please reply to your confirmation email with the requested information.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Revision Request Section */}
        {canRequestRevision && !hasRevisionRequest && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              {revisionSubmitted ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <p>Revision request submitted! We'll get back to you soon.</p>
                </div>
              ) : showRevisionForm ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Request a Revision</h3>
                  <p className="text-sm text-muted-foreground">
                    Let us know what you'd like changed. Be as specific as possible.
                  </p>
                  <Textarea
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder="Please describe what changes you'd like..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRevisionSubmit}
                      disabled={isSubmittingRevision || !revisionText.trim()}
                    >
                      {isSubmittingRevision ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRevisionForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Need changes?</h3>
                    <p className="text-sm text-muted-foreground">
                      Request a revision if something isn't quite right.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowRevisionForm(true)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Revision Request Submitted */}
        {hasRevisionRequest && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-blue-700">
                <RefreshCw className="h-5 w-5" />
                <div>
                  <p className="font-medium">Revision Request Submitted</p>
                  <p className="text-sm">We're working on your changes. You'll receive an email when ready.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Order Date</dt>
                <dd className="font-medium">{formatDateTime(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Target Role</dt>
                <dd className="font-medium">{order.jobTitles}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Industries</dt>
                <dd className="font-medium">{order.industries.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{order.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Timeline */}
        {timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === timeline.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {index < timeline.length - 1 && (
                        <div className="w-px h-full bg-muted-foreground/20 my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-sm">{event.action}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(event.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Questions? Reply to your confirmation email or contact us at hello@applybetter.com</p>
        </div>
      </main>
    </div>
  );
}
