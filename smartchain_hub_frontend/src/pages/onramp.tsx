import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "@/context/Web3Context";

type Method = "card" | "bank" | "mpesa";

const METHODS: { id: Method; label: string; sub: string; color: string; icon: React.ReactNode }[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    sub: "Visa, Mastercard, Amex via Stripe",
    color: "blue",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    id: "bank",
    label: "Bank Transfer",
    sub: "SEPA, ACH, BACS via Stripe",
    color: "purple",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
      </svg>
    ),
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    sub: "Mobile money · Kenya, Tanzania, Uganda",
    color: "green",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
  },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; btn: string; ring: string }> = {
  blue:   { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",   ring: "focus:ring-blue-500 focus:border-blue-500" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", btn: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20", ring: "focus:ring-purple-500 focus:border-purple-500" },
  green:  { border: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-400",  btn: "bg-green-600 hover:bg-green-500 shadow-green-600/20",  ring: "focus:ring-green-500 focus:border-green-500" },
};

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
  const colors = COLOR_MAP[METHODS.find(m => m.id === method)?.color || "blue"];
  const estimated = (parseFloat(amount || "0") * 2).toFixed(2);

  // Handle return from Stripe / Flutterwave redirect
  useEffect(() => {
    const { status: s, ref, method: m } = router.query;
    if (s === "success") {
      setStatus({
        type: "success",
        msg: `Payment confirmed${ref ? ` (ref: ${ref})` : ""}. A0GI is being delivered to your wallet — check your balance in 1–2 minutes.`,
      });
    } else if (s === "cancelled") {
      setStatus({ type: "info", msg: "Payment cancelled. No charge was made." });
    }
  }, [router.query]);

  const handleManualConnect = () => {
    if (!manualAddress.trim()) { setStatus({ type: "error", msg: "Enter a wallet address" }); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress.trim())) { setStatus({ type: "error", msg: "Invalid Ethereum address format" }); return; }
    setUseManual(true);
    setStatus({ type: "success", msg: "Wallet connected in read-only mode" });
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
          setStatus({ type: "error", msg: data.error || data.detail || "Payment session failed" });
        }
      } else {
        const res = await fetch("/api/onramp/mpesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parseFloat(amount), phone, walletAddress: displayAddress }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus({
            type: "success",
            msg: `${data.message} You will receive ${data.a0giAmount} A0GI (${data.localAmount}) after confirming your PIN.`,
          });
        } else {
          setStatus({ type: "error", msg: data.error || data.detail || "M-Pesa request failed" });
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Connect your wallet first</h2>
            <p className="text-gray-500 text-sm mb-6">We need your wallet address to send A0GI after payment.</p>

            <button onClick={connectWallet}
              className="w-full mb-4 flex items-center justify-center gap-3 px-6 py-3 bg-orange-600/10 border border-orange-600/30 text-orange-400 rounded-xl hover:bg-orange-600/20 transition-colors text-sm font-semibold">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
              </svg>
              Connect with MetaMask
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-800"/>
              <span className="text-xs text-gray-600">or enter manually</span>
              <div className="flex-1 h-px bg-gray-800"/>
            </div>
            <div className="flex gap-2">
              <input type="text" value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                placeholder="0x604cDb..." className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm font-mono"/>
              <button onClick={handleManualConnect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm">
                Use
              </button>
            </div>
            {status && (
              <p className={`mt-3 text-xs ${status.type === "error" ? "text-red-400" : "text-green-400"}`}>
                {status.msg}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Main page ──────────────────────────────────────────────────
  return (
    <>
      <Head><title>Buy A0GI | SmartChain Hub</title></Head>
      <div className="space-y-6 max-w-2xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Buy A0GI</h1>
          <p className="text-gray-500 text-sm">
            Pay with card, bank transfer, or M-Pesa — receive A0GI directly to your wallet on 0G Galileo Testnet.
          </p>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-3 gap-3">
          {METHODS.map(m => {
            const c = COLOR_MAP[m.color];
            const active = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${active ? `${c.border} ${c.bg}` : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${active ? `${c.bg}` : "bg-gray-800"}`}>
                  <span className={active ? c.text : "text-gray-500"}>{m.icon}</span>
                </div>
                <p className={`font-bold text-xs ${active ? "text-white" : "text-gray-400"}`}>{m.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

          {/* Amount */}
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1.5">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" placeholder="10"
                className={`w-full pl-8 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-1 text-sm transition-colors ${colors.ring}`}/>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                ≈ <span className="text-white font-semibold">{estimated} A0GI</span>
                <span className="text-gray-600"> · Rate: 1 USD = 2 A0GI</span>
              </p>
              <div className="flex gap-1.5">
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
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+254712345678"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"/>
              <p className="text-xs text-gray-600 mt-1.5">
                Supported: Kenya (+254), Tanzania (+255), Uganda (+256), Rwanda (+250), Ghana (+233)
              </p>
            </div>
          )}

          {/* Bank transfer info */}
          {method === "bank" && (
            <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-purple-400 font-semibold mb-1">Bank Transfer via Stripe</p>
              <p className="text-xs text-gray-500">
                Supports SEPA (Europe), ACH (USA), BACS (UK). After clicking Pay, Stripe will provide bank details.
                Transfers take 1–3 business days. A0GI is delivered automatically after funds clear.
              </p>
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
              status.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400"
              : status.type === "info"    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              :                             "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <span className="text-lg shrink-0">
                {status.type === "success" ? "✅" : status.type === "info" ? "ℹ️" : "❌"}
              </span>
              <p className="leading-relaxed">{status.msg}</p>
            </div>
          )}

          {/* Pay button */}
          <button onClick={handlePay}
            disabled={loading || !amount || parseFloat(amount) < 1}
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg ${colors.btn}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Processing...
              </span>
            ) : method === "card" ? `Pay $${amount} with Card →`
              : method === "bank" ? `Pay $${amount} via Bank Transfer →`
              : `Pay $${amount} via M-Pesa →`}
          </button>

          <p className="text-xs text-gray-600 text-center">
            {method === "card" ? "Secured by Stripe · SSL encrypted · No card data stored"
            : method === "bank" ? "Secured by Stripe · Bank-grade encryption"
            : "Powered by Flutterwave · STK Push · PIN required"}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Fast Delivery", desc: "Card: instant · Bank: 1–3 days · M-Pesa: ~2 min" },
            { icon: "🔒", title: "Secure", desc: "Stripe PCI-DSS compliant · Flutterwave licensed" },
            { icon: "🌍", title: "Global", desc: "Cards worldwide · M-Pesa East Africa · SEPA/ACH/BACS" },
          ].map(item => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-white font-bold text-sm mb-1">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Setup instructions for developers */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Developer Setup</p>
          <div className="space-y-2 text-xs text-gray-500">
            <p><span className="text-gray-300 font-mono">STRIPE_SECRET_KEY</span> — Get from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">dashboard.stripe.com/apikeys</a></p>
            <p><span className="text-gray-300 font-mono">STRIPE_WEBHOOK_SECRET</span> — Get from <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">dashboard.stripe.com/webhooks</a> → point to <span className="font-mono">/api/onramp/stripe-webhook</span></p>
            <p><span className="text-gray-300 font-mono">FLUTTERWAVE_SECRET_KEY</span> — Get from <a href="https://dashboard.flutterwave.com/settings/apis" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">dashboard.flutterwave.com</a></p>
            <p><span className="text-gray-300 font-mono">FLUTTERWAVE_WEBHOOK_HASH</span> — Set in Flutterwave dashboard → point to <span className="font-mono">/api/onramp/mpesa-webhook</span></p>
          </div>
        </div>

      </div>
    </>
  );
}
