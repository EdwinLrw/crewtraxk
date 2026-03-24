import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const PLAN_TO_PRICE: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body?.plan;

    if (!plan || !PLAN_TO_PRICE[plan]) {
      return Response.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json(
        { error: "Missing STRIPE_SECRET_KEY in environment variables." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PLAN_TO_PRICE[plan],
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing/cancel`,
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return Response.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}