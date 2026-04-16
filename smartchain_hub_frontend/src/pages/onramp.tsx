import Head from "next/head";
import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";

// On-ramp: user pays fiat → receives A0GI to their wallet
// Stripe for cards, Flutterwave for M-Pesa
export default function OnRamp() {
  const { address, isConnected, connectWallet } = useWeb3();
  const [method, setMethod] = useState<"card" | "mpesa">("card");
  const [amount, setAmount] = useState("10");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Estimated A0GI (mock rate: 1 USD = 2 A0GI)
  const estimated = (parseFloat(amount || "0") * 2).toFixed(2);

  const handleCardPay = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/onramp/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), walletAddress: address }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url; // Stripe checkout redirect
      else setStatus(data.error || "Failed to create payment");
    } catch {
      setStatus("Payment service unavailable");
    } finally { setLoading(false); }
  };

  const handleMpesa = async () => {
    if (!phone) { setStatus("Enter your M-Pesa phone number"); return; }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/onramp/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), phone, walletAddress: address }),
      });
      const data = await res.json();
      if (data.success) setStatus(`✓ M-Pesa prompt sent to ${phone}. Check your phone.`);
      else setStatus(data.error || "M-Pesa request failed");
    } catch {
      setStatus("M-Pesa service unavailable");
    } finally { setLoading(false); }
  };

  if (!isConnected) return (
    <>
      <Head><title>Buy A0GI | PayOptimize</title></Head>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Connect your wallet to buy A0GI</p>
          <button onClick={connectWallet} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Connect Wallet</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><title>Buy A0GI | PayOptimize</title></Head>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg">
          <h2 className="text-base font-bold text-gray-800 mb-1">Buy A0GI</h2>
          <p className="text-xs text-gray-400 mb-6">Pay with card or M-Pesa → receive A0GI directly to your wallet</p>

          {/* Method selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setMethod("card")}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${method === "card" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"}`}>
              💳 Credit Card
            </button>
            <button onClick={() => setMethod("mpesa")}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${method === "mpesa" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
              📱 M-Pesa
            </button>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">Amount (USD)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="5" placeholder="10"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <p className="text-xs text-gray-400 mt-1.5">≈ {estimated} A0GI · Rate: 1 USD = 2 A0GI</p>
          </div>

          {/* M-Pesa phone */}
          {method === "mpesa" && (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">M-Pesa Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"/>
            </div>
          )}

          {/* Wallet destination */}
          <div className="mb-5 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400">Sending to wallet:</p>
            <p className="text-xs font-mono text-gray-700 truncate">{address}</p>
          </div>

          {status && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${status.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {status}
            </div>
          )}

          <button
            onClick={method === "card" ? handleCardPay : handleMpesa}
            disabled={loading || !amount}
            className={`w-full py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 ${method === "card" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
            {loading ? "Processing..." : method === "card" ? `Pay $${amount} with Card` : `Pay $${amount} via M-Pesa`}
          </button>
        </div>
      </div>
    </>
  );
}
