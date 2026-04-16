import type { NextApiRequest, NextApiResponse } from "next";

// POST /api/onramp/mpesa
// Triggers Flutterwave M-Pesa STK push → on success webhook sends A0GI to wallet
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, phone, walletAddress } = req.body;
  if (!amount || !phone || !walletAddress) return res.status(400).json({ error: "amount, phone, walletAddress required" });

  const flwKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!flwKey) return res.status(503).json({ error: "Flutterwave not configured. Add FLUTTERWAVE_SECRET_KEY to .env.local" });

  try {
    const response = await fetch("https://api.flutterwave.com/v3/charges?type=mpesa", {
      method: "POST",
      headers: { "Authorization": `Bearer ${flwKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "KES",
        email: `${phone.replace("+", "")}@smartchainhub.io`,
        phone_number: phone,
        fullname: "SmartChain User",
        tx_ref: `SCH-${Date.now()}`,
        meta: { walletAddress, a0giAmount: (amount * 2).toFixed(2) },
      }),
    });

    const data = await response.json();
    if (data.status === "success") {
      res.json({ success: true, message: data.message });
    } else {
      res.status(400).json({ error: data.message || "M-Pesa request failed" });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
