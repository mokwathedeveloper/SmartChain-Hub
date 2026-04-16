import Head from "next/head";
import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => { setStatus("sent"); setForm({ name: "", email: "", message: "" }); }, 1200);
  };

  return (
    <>
      <Head><title>Contact | SmartChain Hub</title></Head>
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 min-h-screen">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Get in Touch</h1>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Have questions about SmartChain Hub? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              {status === "sent" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setStatus("idle")} className="text-blue-600 text-sm font-medium hover:underline">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                    <input type="text" required placeholder="Enter your name..." value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                    <input type="email" required placeholder="Enter your email..." value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">AI Message</label>
                    <textarea required rows={4} placeholder="Type..." value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                  </div>
                  <button type="submit" disabled={status === "sending"}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
                    {status === "sending" ? "Sending..." : "Submit Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Contact info + map */}
            <div className="space-y-6">
              {/* Contact details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-800 mb-5">Contact Information</h2>
                <div className="space-y-4">
                  {[
                    { icon: "✉️", label: "Email", value: "support@smartchainhub.io" },
                    { icon: "💬", label: "Discord", value: "discord.gg/smartchain" },
                    { icon: "🐦", label: "Twitter", value: "@SmartChainHub" },
                    { icon: "🐙", label: "GitHub", value: "github.com/smartchainhub" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 h-52 flex items-center justify-center relative">
                  <svg viewBox="0 0 400 200" className="w-full h-full opacity-60">
                    {/* Map-like grid */}
                    {[0,1,2,3,4].map(i => <line key={`h${i}`} x1="0" y1={i*50} x2="400" y2={i*50} stroke="#818CF8" strokeWidth="0.5" opacity="0.4"/>)}
                    {[0,1,2,3,4,5,6,7,8].map(i => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="200" stroke="#818CF8" strokeWidth="0.5" opacity="0.4"/>)}
                    {/* Roads */}
                    <path d="M0,100 Q100,80 200,100 Q300,120 400,100" stroke="#818CF8" strokeWidth="3" fill="none" opacity="0.6"/>
                    <path d="M200,0 Q180,100 200,200" stroke="#818CF8" strokeWidth="3" fill="none" opacity="0.6"/>
                    {/* Location pin */}
                    <circle cx="200" cy="100" r="12" fill="#3B82F6" opacity="0.9"/>
                    <circle cx="200" cy="100" r="5" fill="white"/>
                    <circle cx="200" cy="100" r="25" fill="#3B82F6" opacity="0.2"/>
                  </svg>
                  <div className="absolute bottom-3 left-3 bg-white rounded-lg px-3 py-1.5 shadow text-xs font-semibold text-gray-700">
                    📍 SmartChain Hub HQ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
