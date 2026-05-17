/**
 * POST /api/onramp/stripe
 *
 * Creates a Stripe Checkout session for:
 *   - Credit/Debit card (Visa, Mastercard, Amex)
 *   - Bank transfer (SEPA, ACH, BACS) via Stripe
 *
 * After payment, Stripe calls /api/onramp/stripe-webhook which delivers A0GI.
 *
 * Body: { amount: number, walletAddress: string, paymentType?: "card" | "bank" }
 * Returns: { url: string } — redirect to Stripe Checkout
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIp(req);
  if (!rateLimit(`stripe:${ip}`, 5, 60_000)) {
    return res.status(429).json({ error: "Too many requests — please wait before trying again." });
  }

  const { amount, walletAddress, paymentType = "card" } = req.body;

  if (!amount || !walletAddress) {
    return res.status(400).json({ error: "amount and walletAddress required" });
  }
  if (parseFloat(amount) < 1) {
    return res.status(400).json({ error: "Minimum amount is $1" });
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes("placeholder") || !stripeKey.startsWith("sk_")) {
    return res.status(503).json({
      error: "Stripe not configured",
      detail: "Add STRIPE_SECRET_KEY to .env.local. Get your key at https://dashboard.stripe.com/apikeys",
    });
  }

  // Build app URL from request headers to work both locally and in production
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const a0giAmount = (parseFloat(amount) * 2).toFixed(2);
  const txRef = `SCH-${Date.now()}-${walletAddress.slice(2, 8)}`;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    // Payment method types based on selection
    // Bank transfer uses card payment with bank redirect note
    // us_bank_account requires Financial Connections activation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Buy ${a0giAmount} A0GI`,
            description: `Delivered to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} on 0G Galileo Testnet`,
            images: ["https://smartchainhubfrontend.vercel.app/logo.png"],
          },
          unit_amount: Math.round(parseFloat(amount) * 100), // cents
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${appUrl}/onramp?status=success&ref=${txRef}&method=${paymentType}`,
      cancel_url: `${appUrl}/onramp?status=cancelled`,
      metadata: {
        walletAddress,
        a0giAmount,
        txRef,
        paymentType,
      },
      payment_intent_data: {
        metadata: { walletAddress, a0giAmount, txRef },
      },
    });

    return res.status(200).json({ url: session.url, txRef });
  } catch (e: unknown) {
    console.error("Stripe error:", errMsg(e));
    return res.status(500).json({ error: errMsg(e) });
  }
}
