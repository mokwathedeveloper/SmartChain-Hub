/**
 * POST /api/onramp/stripe-webhook
 *
 * Stripe calls this endpoint after a payment is completed.
 * Verifies the webhook signature, then delivers A0GI to the buyer's wallet.
 *
 * Setup in Stripe Dashboard:
 *   Webhooks → Add endpoint → https://your-domain.com/api/onramp/stripe-webhook
 *   Events: checkout.session.completed, payment_intent.succeeded
 *
 * Add STRIPE_WEBHOOK_SECRET to .env.local
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { errMsg } from "@/utils/errors";
import { deliverA0GI, logPayment } from "@/utils/onrampDelivery";

// Disable body parsing — Stripe needs raw body for signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const STRIPE_CENTS = 100; // Stripe amounts are in cents; divide by 100 for USD

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return res.status(503).json({ error: "Stripe not configured" });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e: unknown) {
    console.error("Stripe webhook signature verification failed:", errMsg(e));
    return res.status(400).json({ error: `Webhook signature invalid: ${errMsg(e)}` });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { walletAddress, a0giAmount, txRef, paymentType } = session.metadata || {};

    if (!walletAddress || !a0giAmount || !txRef) {
      console.error("Missing metadata in Stripe session:", session.id);
      return res.status(400).json({ error: "Missing metadata" });
    }

    // Only deliver if payment is paid (not for bank transfers still pending)
    if (session.payment_status !== "paid") {
      await logPayment({
        walletAddress,
        amountUsd: (session.amount_total ?? 0) / STRIPE_CENTS,
        a0giAmount,
        method: paymentType === "bank" ? "bank" : "stripe",
        txRef,
        status: "pending",
      });
      return res.status(200).json({ received: true, status: "pending" });
    }

    try {
      const { txHash, explorerUrl } = await deliverA0GI(walletAddress, a0giAmount, txRef);

      await logPayment({
        walletAddress,
        amountUsd: (session.amount_total ?? 0) / STRIPE_CENTS,
        a0giAmount,
        method: paymentType === "bank" ? "bank" : "stripe",
        txRef,
        status: "completed",
        txHash,
      });

      console.log(`✅ Delivered ${a0giAmount} A0GI to ${walletAddress} | tx: ${explorerUrl}`);
      return res.status(200).json({ received: true, txHash, explorerUrl });
    } catch (e: unknown) {
      console.error("A0GI delivery failed:", errMsg(e));
      await logPayment({
        walletAddress,
        amountUsd: (session.amount_total ?? 0) / STRIPE_CENTS,
        a0giAmount,
        method: paymentType === "bank" ? "bank" : "stripe",
        txRef,
        status: "failed",
      });
      return res.status(500).json({ error: errMsg(e) });
    }
  }

  // Handle async bank transfer completion
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const { walletAddress, a0giAmount, txRef } = intent.metadata || {};

    if (walletAddress && a0giAmount && txRef) {
      try {
        const { txHash, explorerUrl } = await deliverA0GI(walletAddress, a0giAmount, txRef);
        await logPayment({
          walletAddress,
          amountUsd: intent.amount / STRIPE_CENTS,
          a0giAmount,
          method: "bank",
          txRef,
          status: "completed",
          txHash,
        });
        console.log(`✅ Bank transfer: Delivered ${a0giAmount} A0GI to ${walletAddress} | tx: ${explorerUrl}`);
      } catch (e: unknown) {
        console.error("Bank transfer A0GI delivery failed:", errMsg(e));
      }
    }
  }

  return res.status(200).json({ received: true });
}
