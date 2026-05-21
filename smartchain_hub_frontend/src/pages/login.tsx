import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { EyeToggle } from "@/components/auth/EyeToggle";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Spinner } from "@/components/auth/Spinner";
import { inputCls, submitBtnCls } from "@/components/auth/authStyles";

type OAuthProvider = "google" | "azure" | "apple";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Connection failed — check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: OAuthProvider) => {
    setSocialLoading(provider);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) { setError(error.message); setSocialLoading(null); }
    } catch {
      setError("Connection failed — check your internet connection and try again.");
      setSocialLoading(null);
    }
  };

  return (
    <>
      <Head><title>Sign In — SmartChain Hub</title></Head>
      <AuthCard>
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <AuthLogo size="md" />
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Optimize Today. Earn Tomorrow.
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sign in to your sovereign agent account
        </p>

        {/* Error */}
        {error && (
          <div role="alert" className="mb-5 p-3.5 rounded-xl text-sm border flex items-start gap-2.5"
               style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" }}>
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Email address
            </label>
            <input
              id="login-email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="login-password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pr-11`}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border transition-all peer-checked:border-violet-500 peer-checked:bg-violet-600 flex items-center justify-center"
                     style={{ borderColor: rememberMe ? undefined : "rgba(255,255,255,0.2)", background: rememberMe ? undefined : "transparent" }}>
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>
                Remember me
              </span>
            </label>
            <a href="#" className="text-sm font-medium transition-colors text-violet-400 hover:text-violet-300">
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading} className={submitBtnCls}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span>
              : "Sign In →"
            }
          </button>
        </form>

        <SocialButtons loading={socialLoading} onSelect={handleSocial} />

        <p className="text-center text-sm mt-7" style={{ color: "rgba(255,255,255,0.3)" }}>
          No account?{" "}
          <Link href="/signup" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Create one free
          </Link>
        </p>
      </AuthCard>
    </>
  );
}
