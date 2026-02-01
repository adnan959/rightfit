"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, ArrowLeft } from "lucide-react";

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both order ID and email");
      return;
    }

    setIsLoading(true);

    try {
      // Verify the order exists and email matches
      const response = await fetch(`/api/order/${orderId}?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        // Generate token and redirect
        const tokenResponse = await fetch("/api/order/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, email }),
        });
        const tokenData = await tokenResponse.json();

        if (tokenData.success) {
          router.push(`/order/${orderId}?token=${tokenData.token}`);
        } else {
          // Fallback - redirect without token
          router.push(`/order/${orderId}?email=${encodeURIComponent(email)}`);
        }
      } else {
        setError("Order not found. Please check your order ID and email address.");
      }
    } catch (err) {
      console.error("Error looking up order:", err);
      setError("Failed to look up order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">ApplyBetter</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Find Your Order</CardTitle>
            <CardDescription>
              Enter your order ID and email to view your order status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., a1b2c3d4"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your confirmation email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Looking up..." : "Find Order"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Can't find your order?{" "}
                <a href="mailto:hello@applybetter.com" className="text-primary hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
