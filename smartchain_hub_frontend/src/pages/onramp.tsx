import Head from "next/head";
import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";

export default function OnRamp() {
  const { address, isConnected, connectWallet } = useWeb3();
  const [method, setMethod] = useState<"card" | "mpesa">("card");
  const [amount, setAmount] = useState("10");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [useManual, setUseManual] = useState(false);

  const displayAddress = address || manualAddress;
  const isWalletConnected = isConnected || (manualAddress && manualAddress.length > 0);
  
  const handleManualConnect = () => {
    if (!manualAddress.trim()) {
      setStatus({ type: "error", msg: "Please enter a wallet address" });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress.trim())) {
      setStatus({ type: "error", msg: "Invalid Ethereum address format" });
      return;
    }
    setUseManual(true);
    setStatus({ type: "success", msg: "Wallet connected in read-only mode" });
  };

  const estimated = (parseFloat(amount || "0") * 2).toFixed(2);

  const handleCardPay = async () => {
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/onramp/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), walletAddress: displayAddress }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setStatus({ type: "error", msg: data.error || "Failed to create payment session" });
    } catch {
      setStatus({ type: "error", msg: "Payment service unavailable. Check STRIPE_SECRET_KEY." });
    } finally { setLoading(false); }
  };

  const handleMpesa = async () => {
    if (!phone) { setStatus({ type: "error", msg: "Enter your M-Pesa phone number" }); return; }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/onramp/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), phone, walletAddress: displayAddress }),
      });
      const data = await res.json();
      if (data.success) setStatus({ type: "success", msg: `M-Pesa prompt sent to ${phone}. Check your phone.` });
      else setStatus({ type: "error", msg: data.error || "M-Pesa request failed" });
    } catch {
      setStatus({ type: "error", msg: "M-Pesa service unavailable. Check FLUTTERWAVE_SECRET_KEY." });
    } finally { setLoading(false); }
  };

  if (!isWalletConnected) {
    return (
      <>
        <Head><title>Buy A0GI | SmartChain Hub</title></Head>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Connect your wallet first</h2>
            <p className="text-gray-500 text-sm mb-4">We need your wallet address to send A0GI after payment.</p>
            
            {/* MetaMask Connection */}
            <button onClick={connectWallet}
              className="w-full max-w-sm mx-auto mb-4 flex items-center justify-center gap-3 px-6 py-3 bg-orange-600/10 border border-orange-600/30 text-orange-400 rounded-xl hover:bg-orange-600/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
                <path d="M30.5 27.5L27 33L34.5 35L36.5 27.5H30.5Z" fill="#E27625"/>
                <path d="M3.5 27.5L5.5 35L13 33L9.5 27.5H3.5Z" fill="#E27625"/>
              </svg>
              Connect with MetaMask
            </button>
            
            {/* Manual Address Input */}
            <div className="w-full max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-gray-800"/>
                <span className="text-xs text-gray-600">or enter manually</span>
                <div className="flex-1 h-px bg-gray-800"/>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  placeholder="0x604cDbDBE7850bAd105C28bFE01Ad680520D451F"
                  className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
                <button onClick={handleManualConnect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm">
                  Connect
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs mt-4">Click "Connect Wallet" in the top right header or use manual entry above</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Buy A0GI | SmartChain Hub</title></Head>
      <div className="space-y-6 max-w-2xl">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Buy A0GI</h1>
          <p className="text-gray-500 text-sm">Pay with card or M-Pesa — receive A0GI directly to your wallet on 0G Galileo Testnet.</p>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMethod("card")}
            className={`p-5 rounded-2xl border-2 transition-all text-left ${
              method === "card"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-800 bg-gray-900 hover:border-gray-700"
            }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === "card" ? "bg-blue-500/20" : "bg-gray-800"}`}>
                <svg className={`w-5 h-5 ${method === "card" ? "text-blue-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              {method === "card" && <span className="w-2 h-2 bg-blue-400 rounded-full"/>}
            </div>
            <p className={`font-bold text-sm ${method === "card" ? "text-white" : "text-gray-400"}`}>Credit / Debit Card</p>
            <p className="text-xs text-gray-600 mt-0.5">Visa, Mastercard via Stripe</p>
          </button>

          <button onClick={() => setMethod("mpesa")}
            className={`p-5 rounded-2xl border-2 transition-all text-left ${
              method === "mpesa"
                ? "border-green-500 bg-green-500/10"
                : "border-gray-800 bg-gray-900 hover:border-gray-700"
            }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === "mpesa" ? "bg-green-500/20" : "bg-gray-800"}`}>
                <svg className={`w-5 h-5 ${method === "mpesa" ? "text-green-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              {method === "mpesa" && <span className="w-2 h-2 bg-green-400 rounded-full"/>}
            </div>
            <p className={`font-bold text-sm ${method === "mpesa" ? "text-white" : "text-gray-400"}`}>M-Pesa</p>
            <p className="text-xs text-gray-600 mt-0.5">Mobile money via Flutterwave</p>
          </button>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

          {/* Amount */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="5" placeholder="10"
                className="w-full pl-8 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"/>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">≈ <span className="text-white font-semibold">{estimated} A0GI</span> · Rate: 1 USD = 2 A0GI</p>
              <div className="flex gap-2">
                {["10", "25", "50", "100"].map(v => (
                  <button key={v} onClick={() => setAmount(v)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${amount === v ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500 hover:text-white"}`}>
                    ${v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* M-Pesa phone */}
          {method === "mpesa" && (
            <div>
              <label className="block text-xs text-gray-500 font-medium mb-1.5">M-Pesa Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-colors"/>
              <p className="text-xs text-gray-600 mt-1.5">Format: +254XXXXXXXXX (Kenya)</p>
            </div>
          )}

          {/* Destination wallet */}
          <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">A0GI will be sent to:</p>
            <p className="text-xs font-mono text-blue-400 truncate">{displayAddress}</p>
            <p className="text-xs text-gray-600 mt-1">0G Galileo Testnet · Chain ID 16602</p>
          </div>

          {/* Status */}
          {status && (
            <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
              status.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <span className="text-lg shrink-0">{status.type === "success" ? "✅" : "❌"}</span>
              <p>{status.msg}</p>
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={method === "card" ? handleCardPay : handleMpesa}
            disabled={loading || !amount || parseFloat(amount) < 1}
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm ${
              method === "card"
                ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                : "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/20"
            }`}>
            {loading
              ? "Processing..."
              : method === "card"
              ? `Pay $${amount} with Card →`
              : `Pay $${amount} via M-Pesa →`
            }
          </button>

          <p className="text-xs text-gray-600 text-center">
            {method === "card"
              ? "Secured by Stripe · SSL encrypted"
              : "Powered by Flutterwave · STK Push"}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Instant", desc: "A0GI delivered within 2 minutes of payment confirmation" },
            { icon: "🔒", title: "Secure", desc: "Payments processed by Stripe and Flutterwave" },
            { icon: "🌍", title: "Global", desc: "Card payments worldwide · M-Pesa for East Africa" },
          ].map(item => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-white font-bold text-sm mb-1">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
