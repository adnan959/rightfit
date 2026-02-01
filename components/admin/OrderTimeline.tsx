"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Upload,
  Send,
  RotateCcw,
  DollarSign,
  Star,
  User,
} from "lucide-react";
import type { SubmissionWithRelations, ActivityLog } from "@/lib/db/types";
import { formatDateTime } from "@/lib/utils";

interface OrderTimelineProps {
  order: SubmissionWithRelations;
}

function getActivityIcon(action: string) {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes("order submitted")) {
    return <FileText className="h-4 w-4 text-blue-500" />;
  }
  if (actionLower.includes("payment")) {
    return <CreditCard className="h-4 w-4 text-green-500" />;
  }
  if (actionLower.includes("ai grade")) {
    return <Star className="h-4 w-4 text-purple-500" />;
  }
  if (actionLower.includes("status changed")) {
    return <CheckCircle className="h-4 w-4 text-blue-500" />;
  }
  if (actionLower.includes("cv uploaded")) {
    return <Upload className="h-4 w-4 text-coral-500" />;
  }
  if (actionLower.includes("note added")) {
    return <MessageSquare className="h-4 w-4 text-gray-500" />;
  }
  if (actionLower.includes("delivered")) {
    return <Send className="h-4 w-4 text-green-500" />;
  }
  if (actionLower.includes("revision")) {
    return <RotateCcw className="h-4 w-4 text-orange-500" />;
  }
  if (actionLower.includes("refund")) {
    return <DollarSign className="h-4 w-4 text-red-500" />;
  }
  if (actionLower.includes("priority")) {
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }
  
  return <Clock className="h-4 w-4 text-gray-400" />;
}

function getActivityColor(action: string): string {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes("payment received") || actionLower.includes("delivered")) {
    return "bg-green-100 border-green-300";
  }
  if (actionLower.includes("refund")) {
    return "bg-red-100 border-red-300";
  }
  if (actionLower.includes("cv uploaded")) {
    return "bg-coral-100 border-coral-300";
  }
  if (actionLower.includes("ai grade")) {
    return "bg-purple-100 border-purple-300";
  }
  if (actionLower.includes("revision") || actionLower.includes("priority")) {
    return "bg-orange-100 border-orange-300";
  }
  
  return "bg-gray-100 border-gray-300";
}

function getActorBadge(actor: string) {
  if (actor === "system") {
    return (
      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
        System
      </Badge>
    );
  }
  if (actor === "admin") {
    return (
      <Badge variant="secondary" className="text-xs bg-coral-100 text-coral-700">
        Admin
      </Badge>
    );
  }
  if (actor === "customer") {
    return (
      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
        Customer
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {actor}
    </Badge>
  );
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Sort activity log by date (newest first)
  const sortedActivities = [...(order.activity_log || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-gray-500">
          <Clock className="h-4 w-4" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

            {/* Timeline items */}
            <div className="space-y-4">
              {sortedActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${getActivityColor(
                      activity.action
                    )}`}
                  >
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      {getActorBadge(activity.actor)}
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {activity.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDateTime(activity.created_at)}
                    </p>

                    {/* Additional metadata display */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {typeof activity.metadata.score === "number" && (
                          <Badge variant="outline" className="text-xs">
                            Score: {activity.metadata.score}/100
                          </Badge>
                        )}
                        {typeof activity.metadata.version === "number" && (
                          <Badge variant="outline" className="text-xs">
                            Version {activity.metadata.version}
                          </Badge>
                        )}
                        {typeof activity.metadata.from === "string" && typeof activity.metadata.to === "string" && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.from} → {activity.metadata.to}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Order created marker (always at bottom) */}
              <div className="relative flex gap-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-gray-200 border-gray-300">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Order created</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="h-8 w-8 text-gray-300" />
            <p className="mt-2">No activity recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
