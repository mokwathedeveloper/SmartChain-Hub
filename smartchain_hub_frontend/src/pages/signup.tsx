import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please agree to the Terms of Service"); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) setError(error.message);
    else router.push("/login");
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors";

  return (
    <>
      <Head><title>Create Account | SmartChain Hub</title></Head>
      <div className="min-h-screen flex bg-gray-950">
        {/* Left panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 border-r border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
                <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
              </svg>
            </div>
            <span className="font-bold text-white text-lg">SmartChain Hub</span>
          </Link>
          <div>
            <h2 className="text-4xl font-black text-white mb-4">Join the Agentic Economy.</h2>
            <p className="text-gray-400 text-lg mb-8">Every account gets a sovereign AI agent with on-chain identity and persistent memory on 0G.</p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">What you get</p>
              {[
                ["🤖", "Soulbound Agent ID", "Non-transferable NFT on 0G Chain"],
                ["🧠", "Persistent Memory", "Survives browser resets via 0G KV"],
                ["⚡", "AI Optimization", "TEE-verified via 0G Compute"],
                ["💰", "Revenue Sharing", "Earn from every platform transaction"],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-gray-600 text-sm">© 2026 SmartChain Hub · Built on 0G</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
                  <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
                </svg>
              </div>
              <span className="font-bold text-white">SmartChain Hub</span>
            </div>

            <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-gray-500 mb-8">Free forever. No credit card required.</p>

            {error && (
              <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Satoshi Nakamoto" className={inputCls}/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls}/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className={`${inputCls} pr-11`}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className={`${inputCls} pr-11`}/>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm text-gray-500">
                  I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                </span>
              </label>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
