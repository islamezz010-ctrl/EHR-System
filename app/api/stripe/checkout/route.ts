import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount?: number;
      billIds?: string[];
      patientName?: string;
    };

    const amount = body.amount;
    const billIds = body.billIds ?? [];
    const patientName = body.patientName ?? "Patient";

    if (!amount || amount <= 0 || billIds.length === 0) {
      return NextResponse.json(
        { message: "No outstanding balance to pay." },
        { status: 400 },
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!secretKey) {
      return NextResponse.json({
        demo: true,
        message: "Demo mode — Stripe keys not configured. Payment simulated.",
      });
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "usd");
    params.set(
      "line_items[0][price_data][unit_amount]",
      String(Math.round(amount * 100)),
    );
    params.set(
      "line_items[0][price_data][product_data][name]",
      "Medi EHR — Outstanding medical bills",
    );
    params.set(
      "line_items[0][price_data][product_data][description]",
      `${billIds.length} bill(s) for ${patientName}`,
    );
    params.set("success_url", `${appUrl}/dashboard?tab=Bills&payment=success`);
    params.set("cancel_url", `${appUrl}/dashboard?tab=Bills&payment=cancelled`);
    params.set("metadata[billIds]", billIds.join(","));
    params.set("metadata[patientName]", patientName);

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const session = (await stripeResponse.json()) as {
      url?: string;
      error?: { message?: string };
    };

    if (!stripeResponse.ok) {
      throw new Error(session.error?.message ?? "Stripe checkout failed.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session.",
      },
      { status: 500 },
    );
  }
}
