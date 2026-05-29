import { NextResponse } from "next/server";
import Stripe from "stripe";

import type { PatientBillItem } from "@/lib/patient-bills";

type CheckoutRequestBody = {
  bills: Pick<PatientBillItem, "id" | "description" | "patientOwes">[];
};

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 },
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payableBills = body.bills?.filter((bill) => bill.patientOwes > 0) ?? [];

  if (payableBills.length === 0) {
    return NextResponse.json(
      { error: "No outstanding balance to pay." },
      { status: 400 },
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: payableBills.map((bill) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(bill.patientOwes * 100),
          product_data: {
            name: bill.description.slice(0, 120),
          },
        },
        quantity: 1,
      })),
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      metadata: {
        billIds: payableBills.map((bill) => bill.id).join(","),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
