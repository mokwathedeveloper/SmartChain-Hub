/**
 * POST /api/onramp/mpesa
 *
 * Triggers a Flutterwave M-Pesa STK push to the user's phone.
 * After payment, Flutterwave calls /api/onramp/mpesa-webhook which delivers A0GI.
 *
 * Body: { amount: number, phone: string, walletAddress: string }
 * Returns: { success: true, message: string, txRef: string }
 *
 * Supported countries: Kenya (KES), Tanzania (TZS), Uganda (UGX), Rwanda (RWF)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { errMsg } from "@/utils/errors";
import { logPayment } from "@/utils/onrampDelivery";
import { rateLimit, getClientIp } from "@/utils/rateLimit";

// Currency map by phone prefix
const CURRENCY_MAP: Record<string, { currency: string; country: string }> = {
  "+254": { currency: "KES", country: "KE" }, // Kenya
  "+255": { currency: "TZS", country: "TZ" }, // Tanzania
  "+256": { currency: "UGX", country: "UG" }, // Uganda
  "+250": { currency: "RWF", country: "RW" }, // Rwanda
  "+233": { currency: "GHS", country: "GH" }, // Ghana
};

function detectCurrency(phone: string): { currency: string; country: string } {
  for (const [prefix, info] of Object.entries(CURRENCY_MAP)) {
    if (phone.startsWith(prefix)) return info;
  }
  return { currency: "KES", country: "KE" }; // default Kenya
}

// USD to local currency approximate rates (update periodically)
const USD_RATES: Record<string, number> = {
  KES: 130,
  TZS: 2600,
  UGX: 3700,
  RWF: 1300,
  GHS: 15,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIp(req);
  if (!rateLimit(`mpesa:${ip}`, 5, 60_000)) {
    return res.status(429).json({ error: "Too many requests — please wait before trying again." });
  }

  const { amount, phone, walletAddress } = req.body;

  if (!amount || !phone || !walletAddress) {
    return res.status(400).json({ error: "amount, phone, and walletAddress required" });
  }
  if (parseFloat(amount) < 1) {
    return res.status(400).json({ error: "Minimum amount is $1" });
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }
  if (!/^\+\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number. Use format: +254XXXXXXXXX" });
  }

  const flwKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!flwKey || flwKey.includes("placeholder") || !flwKey.startsWith("FLWSECK")) {
    return res.status(503).json({
      error: "Flutterwave not configured",
      detail: "Add FLUTTERWAVE_SECRET_KEY to .env.local. Get your key at https://dashboard.flutterwave.com/settings/apis",
    });
  }

  const { currency, country } = detectCurrency(phone);
  const rate = USD_RATES[currency] || 130;
  const localAmount = Math.round(parseFloat(amount) * rate);
  const a0giAmount = (parseFloat(amount) * 2).toFixed(2);
  const txRef = `SCH-MPESA-${Date.now()}-${walletAddress.slice(2, 8)}`;

  try {
    const response = await fetch("https://api.flutterwave.com/v3/charges?type=mpesa", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${flwKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: localAmount,
        currency,
        email: `${phone.replace("+", "")}@smartchainhub.io`,
        phone_number: phone,
        fullname: "SmartChain User",
        tx_ref: txRef,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/onramp?status=success&ref=${txRef}&method=mpesa`,
        meta: {
          walletAddress,
          a0giAmount,
          usdAmount: amount,
          country,
        },
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      // Log as pending — webhook will mark completed after payment
      await logPayment({
        walletAddress,
        amountUsd: parseFloat(amount),
        a0giAmount,
        method: "mpesa",
        txRef,
        status: "pending",
      });

      return res.status(200).json({
        success: true,
        message: `M-Pesa prompt sent to ${phone}. Enter your PIN to complete payment.`,
        txRef,
        localAmount: `${localAmount} ${currency}`,
        a0giAmount,
      });
    } else {
      return res.status(400).json({
        error: data.message || "M-Pesa request failed",
        detail: data.data?.message || "",
      });
    }
  } catch (e: unknown) {
    console.error("Flutterwave M-Pesa error:", errMsg(e));
    return res.status(500).json({ error: errMsg(e) });
  }
}
