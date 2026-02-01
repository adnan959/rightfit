"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Play,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface TimelineCardProps {
  title: string;
  description?: string | null;
  timestamp?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
  isFirst?: boolean;
  isLast?: boolean;
  variant?: "compact" | "full";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
}

function getEventIcon(action: string) {
  const actionLower = action.toLowerCase();

  if (actionLower.includes("order submitted") || actionLower.includes("order created")) {
    return <Play className="h-3.5 w-3.5 text-blue-600" />;
  }
  if (actionLower.includes("payment")) {
    return <CreditCard className="h-3.5 w-3.5 text-green-600" />;
  }
  if (actionLower.includes("ai grade")) {
    return <Star className="h-3.5 w-3.5 text-purple-600" />;
  }
  if (actionLower.includes("status changed") || actionLower.includes("status")) {
    return <CheckCircle className="h-3.5 w-3.5 text-blue-600" />;
  }
  if (actionLower.includes("cv uploaded") || actionLower.includes("upload")) {
    return <Upload className="h-3.5 w-3.5 text-coral-600" />;
  }
  if (actionLower.includes("note")) {
    return <MessageSquare className="h-3.5 w-3.5 text-gray-600" />;
  }
  if (actionLower.includes("deliver")) {
    return <Send className="h-3.5 w-3.5 text-green-600" />;
  }
  if (actionLower.includes("revision")) {
    return <RotateCcw className="h-3.5 w-3.5 text-orange-600" />;
  }
  if (actionLower.includes("refund")) {
    return <DollarSign className="h-3.5 w-3.5 text-red-600" />;
  }
  if (actionLower.includes("priority")) {
    return <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />;
  }
  if (actionLower.includes("submission") || actionLower.includes("details")) {
    return <FileText className="h-3.5 w-3.5 text-gray-600" />;
  }

  return <Clock className="h-3.5 w-3.5 text-gray-500" />;
}

function getEventColor(action: string): string {
  const actionLower = action.toLowerCase();

  if (actionLower.includes("payment received") || actionLower.includes("deliver")) {
    return "bg-green-100 border-green-300";
  }
  if (actionLower.includes("refund")) {
    return "bg-red-100 border-red-300";
  }
  if (actionLower.includes("cv uploaded") || actionLower.includes("upload")) {
    return "bg-coral-100 border-coral-300";
  }
  if (actionLower.includes("ai grade")) {
    return "bg-purple-100 border-purple-300";
  }
  if (actionLower.includes("order submitted")) {
    return "bg-blue-100 border-blue-300";
  }
  if (actionLower.includes("revision") || actionLower.includes("priority")) {
    return "bg-orange-100 border-orange-300";
  }

  return "bg-gray-100 border-gray-200";
}

export function TimelineCard({
  title,
  description,
  timestamp,
  actor,
  metadata,
  isFirst = false,
  isLast = false,
  variant = "compact",
  children,
  icon,
  rightContent,
}: TimelineCardProps) {
  const displayIcon = icon || getEventIcon(title);
  const dotColor = getEventColor(title);

  return (
    <div className="relative flex gap-3">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center w-7 flex-shrink-0">
        {!isFirst && <div className="w-px h-3 bg-gray-200" />}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotColor} z-10 bg-white`}
        >
          {displayIcon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 min-h-[12px]" />}
      </div>

      {/* Card content */}
      <div className={`flex-1 ${isLast ? "" : "pb-3"}`}>
        <Card className={`overflow-hidden ${variant === "compact" ? "border-gray-200" : "border-gray-200"}`}>
          {variant === "compact" ? (
            // Compact card for events
            <div className="px-3 py-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {title}
                    </span>
                    {actor && actor !== "system" && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {actor}
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  )}
                  {/* Metadata badges */}
                  {metadata && Object.keys(metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {typeof metadata.score === "number" && (
                        <Badge variant="outline" className="text-xs">
                          Score: {metadata.score}/100
                        </Badge>
                      )}
                      {typeof metadata.version === "number" && (
                        <Badge variant="outline" className="text-xs">
                          V{metadata.version}
                        </Badge>
                      )}
                      {typeof metadata.from === "string" && typeof metadata.to === "string" && (
                        <Badge variant="outline" className="text-xs">
                          {metadata.from} → {metadata.to}
                        </Badge>
                      )}
                      {typeof metadata.amount === "number" && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          ${(metadata.amount / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {rightContent}
                  {timestamp && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Full card for content sections
            <div className="p-0">
              {children}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Simple timeline event for backward compatibility
export function TimelineEvent({
  action,
  description,
  timestamp,
  actor,
  metadata,
  isFirst = false,
  isLast = false,
}: {
  action: string;
  description?: string | null;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, unknown>;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <TimelineCard
      title={action}
      description={description}
      timestamp={timestamp}
      actor={actor}
      metadata={metadata}
      isFirst={isFirst}
      isLast={isLast}
      variant="compact"
    />
  );
}

// Section wrapper for full content cards
export function TimelineSection({
  children,
  title,
  icon,
  showLine = true,
  isFirst = false,
  isLast = false,
}: {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  showLine?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const displayIcon = icon || (title ? getEventIcon(title) : <FileText className="h-3.5 w-3.5 text-gray-600" />);
  const dotColor = title ? getEventColor(title) : "bg-gray-100 border-gray-200";

  return (
    <div className="relative flex gap-3">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center w-7 flex-shrink-0">
        {!isFirst && <div className="w-px h-3 bg-gray-200" />}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotColor} z-10 bg-white`}
        >
          {displayIcon}
        </div>
        {showLine && !isLast && <div className="w-px flex-1 bg-gray-200 min-h-[12px]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? "" : "pb-3"}`}>
        {children}
      </div>
    </div>
  );
}

// End marker for completed/delivered orders
export function TimelineEnd({
  status,
  timestamp,
}: {
  status: "delivered" | "completed" | "refunded" | "in_progress";
  timestamp?: string;
}) {
  if (status === "in_progress") {
    return (
      <div className="relative flex gap-3">
        <div className="flex flex-col items-center w-7">
          <div className="w-px h-3 bg-gray-200" />
          <div className="h-3 w-3 rounded-full bg-coral-500 animate-pulse" />
        </div>
        <div className="pt-0.5">
          <span className="text-xs text-gray-500 italic">In progress...</span>
        </div>
      </div>
    );
  }

  const config = {
    delivered: {
      label: "Order Delivered",
      description: "CV has been sent to customer",
      color: "bg-green-100 border-green-300",
      icon: <Send className="h-3.5 w-3.5 text-green-600" />,
    },
    completed: {
      label: "Order Completed",
      description: "CV rewrite has been completed",
      color: "bg-green-100 border-green-300",
      icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
    },
    refunded: {
      label: "Order Refunded",
      description: "This order has been refunded",
      color: "bg-red-100 border-red-300",
      icon: <DollarSign className="h-3.5 w-3.5 text-red-600" />,
    },
  };

  const { label, description, color, icon } = config[status];

  return (
    <TimelineCard
      title={label}
      description={description}
      timestamp={timestamp}
      isLast={true}
      icon={icon}
    />
  );
}
