import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "@/context/Web3Context";

type Method = "card" | "bank" | "mpesa";

export default function OnRamp() {
  const router = useRouter();
  const { address, isConnected, connectWallet } = useWeb3();

  const [method, setMethod] = useState<Method>("card");
  const [amount, setAmount] = useState("10");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [useManual, setUseManual] = useState(false);

  const displayAddress = address || manualAddress;
  const isWalletConnected = isConnected || useManual;
  const estimated = (parseFloat(amount || "0") * 2).toFixed(2);

  useEffect(() => {
    const { status: s, ref } = router.query;
    if (s === "success") {
      setStatus({ type: "success", msg: `Payment confirmed${ref ? ` (ref: ${ref})` : ""}. A0GI is being delivered to your wallet — check your balance in 1–2 minutes.` });
    } else if (s === "cancelled") {
      setStatus({ type: "info", msg: "Payment cancelled. No charge was made." });
    }
  }, [router.query]);

  const handleManualConnect = () => {
    if (!manualAddress.trim()) { setStatus({ type: "error", msg: "Enter a wallet address" }); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress.trim())) { setStatus({ type: "error", msg: "Invalid Ethereum address format" }); return; }
    setUseManual(true);
    setStatus(null);
  };

  const handlePay = async () => {
    if (!displayAddress) { setStatus({ type: "error", msg: "Connect your wallet first" }); return; }
    if (!amount || parseFloat(amount) < 1) { setStatus({ type: "error", msg: "Minimum amount is $1" }); return; }
    if (method === "mpesa" && !phone) { setStatus({ type: "error", msg: "Enter your M-Pesa phone number" }); return; }

    setLoading(true);
    setStatus(null);

    try {
      if (method === "card" || method === "bank") {
        const res = await fetch("/api/onramp/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parseFloat(amount), walletAddress: displayAddress, paymentType: method }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setStatus({ type: "error", msg: data.error || data.detail || "Payment session failed. Check your Stripe configuration." });
        }
      } else {
        const res = await fetch("/api/onramp/mpesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parseFloat(amount), phone, walletAddress: displayAddress }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus({ type: "success", msg: `${data.message} You will receive ${data.a0giAmount} A0GI after confirming your PIN.` });
        } else {
          setStatus({ type: "error", msg: data.error || data.detail || "M-Pesa request failed." });
        }
      }
    } catch {
      setStatus({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Not connected ──────────────────────────────────────────────
  if (!isWalletConnected) {
    return (
      <>
        <Head><title>Buy A0GI | SmartChain Hub</title></Head>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Connect your wallet</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">We need your wallet address to send A0GI after payment confirmation.</p>

              <button onClick={connectWallet}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl hover:bg-orange-500/20 transition-all font-semibold text-sm mb-4">
                <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                  <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                  <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
                </svg>
                Connect with MetaMask
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-800"/>
                <span className="text-xs text-gray-600">or enter address manually</span>
                <div className="flex-1 h-px bg-gray-800"/>
              </div>

              <div className="flex gap-2">
                <input type="text" value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                  placeholder="0x604cDb..."
                  className="flex-1 px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-xs font-mono"/>
                <button onClick={handleManualConnect}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors">
                  Use
                </button>
              </div>
              {status && (
                <p className={`mt-3 text-xs ${status.type === "error" ? "text-red-400" : "text-green-400"}`}>{status.msg}</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main page ──────────────────────────────────────────────────
  return (
    <>
      <Head><title>Buy A0GI | SmartChain Hub</title></Head>
      <div className="max-w-xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Buy A0GI</h1>
          <p className="text-gray-500 text-sm">Purchase A0GI tokens and receive them directly to your wallet on 0G Galileo Testnet.</p>
        </div>

        {/* Method tabs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-1.5 flex gap-1">
          {([
            { id: "card" as Method,  label: "Card",          icon: "💳" },
            { id: "bank" as Method,  label: "Bank Transfer",  icon: "🏦" },
            { id: "mpesa" as Method, label: "M-Pesa",         icon: "📱" },
          ]).map(m => (
            <button key={m.id} onClick={() => { setMethod(m.id); setStatus(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                method === m.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}>
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
              <span className="sm:hidden">{m.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Method description banner */}
          <div className={`px-6 py-4 border-b border-gray-800 flex items-center gap-3 ${
            method === "card"  ? "bg-blue-500/5" :
            method === "bank"  ? "bg-purple-500/5" :
                                 "bg-green-500/5"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              method === "card"  ? "bg-blue-500/15" :
              method === "bank"  ? "bg-purple-500/15" :
                                   "bg-green-500/15"
            }`}>
              {method === "card" && (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              )}
              {method === "bank" && (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                </svg>
              )}
              {method === "mpesa" && (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {method === "card"  ? "Credit / Debit Card" :
                 method === "bank"  ? "Bank Transfer" :
                                      "M-Pesa Mobile Money"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {method === "card"  ? "Visa, Mastercard, Amex · Instant delivery · Secured by Stripe" :
                 method === "bank"  ? "SEPA · ACH · BACS · 1–3 business days · Secured by Stripe" :
                                      "Kenya · Tanzania · Uganda · Rwanda · Ghana · ~2 min delivery"}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1"
                  className="w-full pl-8 pr-20 py-3.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">USD</span>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {["10", "25", "50", "100"].map(v => (
                  <button key={v} onClick={() => setAmount(v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      amount === v
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white"
                    }`}>
                    ${v}
                  </button>
                ))}
              </div>

              {/* Conversion */}
              <div className="mt-3 p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between">
                <span className="text-gray-500 text-xs">You receive</span>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{estimated}</span>
                  <span className="text-gray-400 text-sm ml-1">A0GI</span>
                  <p className="text-gray-600 text-[10px] mt-0.5">Rate: 1 USD = 2 A0GI</p>
                </div>
              </div>
            </div>

            {/* M-Pesa phone */}
            {method === "mpesa" && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📱</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-sm transition-all"/>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Kenya +254 · Tanzania +255 · Uganda +256 · Rwanda +250 · Ghana +233</p>
              </div>
            )}

            {/* Bank transfer info */}
            {method === "bank" && (
              <div className="space-y-3">
                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm">🏦</span>
                    <p className="text-purple-300 font-semibold text-sm">How bank transfer works</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold shrink-0">1.</span>
                      <span>Click Pay — Stripe shows you the bank account details to transfer to</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold shrink-0">2.</span>
                      <span>Log in to your bank and send the exact amount shown</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold shrink-0">3.</span>
                      <span>A0GI delivered automatically when funds clear (1–3 business days)</span>
                    </div>
                  </div>
                </div>

                {/* Supported banks */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "SEPA",  region: "Europe",    flag: "🇪🇺" },
                    { name: "ACH",   region: "USA",       flag: "🇺🇸" },
                    { name: "BACS",  region: "UK",        flag: "🇬🇧" },
                  ].map(b => (
                    <div key={b.name} className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-center">
                      <div className="text-lg mb-1">{b.flag}</div>
                      <p className="text-white font-bold text-xs">{b.name}</p>
                      <p className="text-gray-600 text-[10px]">{b.region}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destination wallet */}
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 font-medium">Destination wallet</p>
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"/>
                  Connected
                </span>
              </div>
              <p className="text-sm font-mono text-white truncate">{displayAddress}</p>
              <p className="text-xs text-gray-600 mt-1">0G Galileo Testnet · Chain ID 16602</p>
            </div>

            {/* Status message */}
            {status && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                status.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300"
                : status.type === "info"  ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                :                           "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <span className="text-lg shrink-0 mt-0.5">
                  {status.type === "success" ? "✅" : status.type === "info" ? "ℹ️" : "❌"}
                </span>
                <p className="text-sm leading-relaxed">{status.msg}</p>
              </div>
            )}

            {/* Pay button */}
            <button onClick={handlePay}
              disabled={loading || !amount || parseFloat(amount) < 1}
              className={`w-full py-4 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg ${
                method === "card"  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25" :
                method === "bank"  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/25" :
                                     "bg-green-600 hover:bg-green-500 shadow-green-600/25"
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {method === "card"  ? `Pay $${amount} with Card` :
                   method === "bank"  ? `Pay $${amount} via Bank Transfer` :
                                        `Pay $${amount} via M-Pesa`}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              {method === "card"  ? "256-bit SSL · PCI-DSS compliant · No card data stored" :
               method === "bank"  ? "Bank-grade encryption · Powered by Stripe" :
                                    "Powered by Flutterwave · STK Push · PIN required"}
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", title: "Fast",    desc: method === "bank" ? "1–3 business days" : method === "mpesa" ? "~2 minutes" : "Instant" },
            { icon: "🔒", title: "Secure",  desc: method === "mpesa" ? "Flutterwave licensed" : "Stripe PCI-DSS" },
            { icon: "🌍", title: "Global",  desc: method === "mpesa" ? "East & West Africa" : "Worldwide" },
          ].map(item => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xl mb-1.5">{item.icon}</div>
              <p className="text-white font-bold text-xs mb-0.5">{item.title}</p>
              <p className="text-gray-500 text-[10px] leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
