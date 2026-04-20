import Head from "next/head";
import React, { useState } from "react";

const faqs = [
  {
    q: "How do I get testnet tokens to use SmartChain Hub?",
    a: "Go to https://hub.0g.ai/faucet and paste your wallet address. You'll receive 0.1 A0GI on the 0G Galileo Testnet (chainId 16602) which is enough to mint your Agent ID and run several optimizations.",
  },
  {
    q: "What happens if 0G Compute is unavailable?",
    a: "The AI agent automatically falls back to a local TensorFlow model with 6 features. You'll see a 'Local AI' badge instead of '0G Compute TEE'. All other features (storage, Agent ID, revenue) continue working normally.",
  },
  {
    q: "Is my private key safe?",
    a: "Your wallet private key never leaves your browser — MetaMask handles all signing. The STORAGE_PRIVATE_KEY in the backend is a separate low-value wallet used only for 0G Storage uploads.",
  },
  {
    q: "Can I deploy the contracts myself?",
    a: "Yes. Clone the repo, fund a wallet with A0GI, set PRIVATE_KEY in blockchain/.env, and run: npx hardhat run scripts/deploy.js --network og_newton",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => { setStatus("sent"); setForm({ name: "", email: "", subject: "", message: "" }); }, 1200);
  };

  const inputCls = "w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors";

  return (
    <>
      <Head><title>Contact | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gray-950 pt-20 pb-12 border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            We respond within 24 hours
          </div>
          <h1 className="text-5xl font-black text-white mb-4">Get in Touch</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Questions about SmartChain Hub, 0G integration, or the hackathon submission? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="bg-gray-950 py-12 border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
                label: "Email",
                value: "moffatmokwa12@gmail.com",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>,
                label: "Discord",
                value: "discord.gg/0glabs",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
              },
              {
                icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                label: "X (Twitter)",
                value: "@SmartChainHub",
                color: "text-gray-300",
                bg: "bg-gray-500/10",
              },
              {
                icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>,
                label: "GitHub",
                value: "mokwathedeveloper",
                color: "text-gray-300",
                bg: "bg-gray-500/10",
              },
            ].map(item => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="bg-gray-950 py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Form */}
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Send a Message</h2>
              <p className="text-gray-500 text-sm mb-8">We'll get back to you within 24 hours.</p>

              {status === "sent" ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setStatus("idle")}
                    className="text-blue-400 text-sm font-medium hover:text-blue-300">
                    Send another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 font-medium mb-1.5">Full Name</label>
                      <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Satoshi Nakamoto" className={inputCls}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 font-medium mb-1.5">Email</label>
                      <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com" className={inputCls}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className={`${inputCls} bg-gray-950`}>
                      <option value="">Select a topic...</option>
                      <option>0G Integration Question</option>
                      <option>Hackathon Submission</option>
                      <option>Bug Report</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      className={`${inputCls} resize-none`}/>
                  </div>
                  <button type="submit" disabled={status === "sending"}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm">
                    {status === "sending" ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Frequently Asked</h2>
              <p className="text-gray-500 text-sm mb-8">Quick answers to common questions.</p>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left">
                      <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                      <svg className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm leading-relaxed pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-4">Quick Links</p>
                <div className="space-y-2">
                  {[
                    { label: "View on ChainScan", href: "https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08", icon: "🔗" },
                    { label: "GitHub Repository", href: "https://github.com/mokwathedeveloper/SmartChain-Hub", icon: "🐙" },
                    { label: "0G Documentation", href: "https://docs.0g.ai", icon: "📖" },
                    { label: "0G Faucet", href: "https://hub.0g.ai/faucet", icon: "🚰" },
                  ].map(link => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors group">
                      <span>{link.icon}</span>
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{link.label}</span>
                      <svg className="w-4 h-4 text-gray-700 ml-auto group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
