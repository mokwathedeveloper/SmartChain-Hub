import type { NextApiRequest, NextApiResponse } from "next";

// POST /api/onramp/stripe
// Creates a Stripe Checkout session → user pays → webhook sends A0GI to wallet
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, walletAddress } = req.body;
  if (!amount || !walletAddress) return res.status(400).json({ error: "amount and walletAddress required" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(503).json({ error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" });

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Buy A0GI — ${(amount * 2).toFixed(2)} A0GI`, description: `Delivered to ${walletAddress}` },
          unit_amount: Math.round(amount * 100), // cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments?onramp=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onramp`,
      metadata: { walletAddress, a0giAmount: (amount * 2).toFixed(2) },
    });

    res.json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
