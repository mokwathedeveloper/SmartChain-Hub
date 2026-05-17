/**
 * POST /api/onramp/mpesa-webhook
 *
 * Flutterwave calls this after M-Pesa payment is confirmed.
 * Verifies the webhook hash, then delivers A0GI to the buyer's wallet.
 *
 * Setup in Flutterwave Dashboard:
 *   Settings → Webhooks → https://your-domain.com/api/onramp/mpesa-webhook
 *
 * Add FLUTTERWAVE_WEBHOOK_HASH to .env.local (from Flutterwave dashboard)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";
import { deliverA0GI, logPayment } from "@/utils/onrampDelivery";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Verify Flutterwave webhook signature.
  // FLUTTERWAVE_WEBHOOK_HASH is required — if it is not configured we refuse
  // all incoming webhooks rather than letting them through unverified.
  const webhookHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!webhookHash) {
    console.error("FLUTTERWAVE_WEBHOOK_HASH not set — rejecting webhook");
    return res.status(503).json({ error: "Webhook verification not configured" });
  }
  const signature = req.headers["verif-hash"] as string;
  if (!signature || signature !== webhookHash) {
    console.error("Flutterwave webhook signature mismatch");
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const event = req.body;

  // Only process successful charges
  if (event.event !== "charge.completed") {
    return res.status(200).json({ received: true, skipped: true });
  }

  const { data } = event;
  if (!data || data.status !== "successful") {
    return res.status(200).json({ received: true, status: data?.status });
  }

  const { tx_ref, meta } = data;
  const walletAddress = meta?.walletAddress;
  const a0giAmount = meta?.a0giAmount;
  const usdAmount = meta?.usdAmount;

  if (!walletAddress || !a0giAmount || !tx_ref) {
    console.error("Missing metadata in Flutterwave webhook:", data.id);
    return res.status(400).json({ error: "Missing metadata" });
  }

  // Verify payment amount matches expected (anti-fraud)
  const expectedLocal = Math.round(parseFloat(usdAmount || "0") * getRate(data.currency));
  if (data.amount < expectedLocal * 0.95) {
    console.error(`Amount mismatch: got ${data.amount} ${data.currency}, expected ~${expectedLocal}`);
    return res.status(400).json({ error: "Payment amount mismatch" });
  }

  try {
    const { txHash, explorerUrl } = await deliverA0GI(walletAddress, a0giAmount, tx_ref);

    await logPayment({
      walletAddress,
      amountUsd: parseFloat(usdAmount || "0"),
      a0giAmount,
      method: "mpesa",
      txRef: tx_ref,
      status: "completed",
      txHash,
    });

    console.log(`✅ M-Pesa: Delivered ${a0giAmount} A0GI to ${walletAddress} | tx: ${explorerUrl}`);
    return res.status(200).json({ received: true, txHash, explorerUrl });
  } catch (e: unknown) {
    console.error("A0GI delivery failed after M-Pesa:", errMsg(e));
    await logPayment({
      walletAddress,
      amountUsd: parseFloat(usdAmount || "0"),
      a0giAmount,
      method: "mpesa",
      txRef: tx_ref,
      status: "failed",
    });
    return res.status(500).json({ error: errMsg(e) });
  }
}

function getRate(currency: string): number {
  const rates: Record<string, number> = {
    KES: 130, TZS: 2600, UGX: 3700, RWF: 1300, GHS: 15,
  };
  return rates[currency] || 130;
}
