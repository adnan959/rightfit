import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured, CV_REWRITE_PRICE, CV_REWRITE_CURRENCY } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payment processing is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: CV_REWRITE_PRICE,
      currency: CV_REWRITE_CURRENCY,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        name: name || "",
        product: "cv_rewrite",
      },
      receipt_email: email,
      description: "CV Rewrite Service - ApplyBetter",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
