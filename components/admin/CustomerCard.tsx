"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Linkedin,
  ExternalLink,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import type { SubmissionWithRelations, Payment } from "@/lib/db/types";
import { formatDateTime } from "@/lib/utils";

interface CustomerCardProps {
  order: SubmissionWithRelations;
  payment?: Payment;
}

export function CustomerCard({ order, payment }: CustomerCardProps) {
  const getPaymentStatusBadge = () => {
    if (!payment) {
      return (
        <Badge className="bg-gray-100 text-gray-800" variant="secondary">
          <Clock className="mr-1 h-3 w-3" />
          No Payment
        </Badge>
      );
    }

    switch (payment.status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800" variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid (${(payment.amount / 100).toFixed(2)})
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-red-100 text-red-800" variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800" variant="secondary">
            {payment.status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <User className="h-3.5 w-3.5" />
          Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Name */}
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {order.full_name}
          </p>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <a
            href={`mailto:${order.email}`}
            className="text-coral-600 hover:underline truncate"
          >
            {order.email}
          </a>
        </div>

        {/* LinkedIn */}
        {order.linkedin_url && (
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <a
              href={order.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-coral-600 hover:underline"
            >
              LinkedIn Profile
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          {/* Payment Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Payment</span>
            </div>
            {getPaymentStatusBadge()}
          </div>

          {/* Order Date */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Ordered</span>
            </div>
            <p className="text-xs text-gray-900">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Delivery Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Status</span>
            </div>
            {order.delivered_at ? (
              <p className="text-xs text-green-600">Delivered</p>
            ) : order.completed_at ? (
              <p className="text-xs text-blue-600">Completed</p>
            ) : (
              <p className="text-xs text-gray-500">In Progress</p>
            )}
          </div>
        </div>

        {/* Stripe ID */}
        {payment?.stripe_payment_intent_id && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 font-mono truncate">
              {payment.stripe_payment_intent_id}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
