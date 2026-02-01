"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("p-3 sm:p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground sm:mt-1 sm:text-2xl">{value}</p>
          {description && (
            <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-0.5 text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 sm:p-2.5">
          <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        </div>
      </div>
    </Card>
  );
}
