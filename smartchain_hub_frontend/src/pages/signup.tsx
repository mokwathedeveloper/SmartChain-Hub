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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please agree to the Terms of Service"); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) setError(error.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  const handleSocial = async (provider: OAuthProvider) => {
    setSocialLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setError(error.message); setSocialLoading(null); }
  };

  return (
    <>
      <Head><title>Create Account — SmartChain Hub</title></Head>
      <AuthCard>
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <AuthLogo size="md" />
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          Optimize Today. Earn Tomorrow.
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-black text-white mb-1">Create your account</h1>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          Free forever · No credit card required
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
            <label htmlFor="signup-name" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Full name
            </label>
            <input
              id="signup-name" type="text" required autoComplete="name"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Satoshi Nakamoto"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Email address
            </label>
            <input
              id="signup-email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password" type={showPassword ? "text" : "password"} required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputCls} pr-11`}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-semibold mb-2 tracking-wide uppercase"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-confirm" type={showConfirm ? "text" : "password"} required autoComplete="new-password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={`${inputCls} pr-11`}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group pt-1">
            <div className="relative shrink-0 mt-0.5">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only peer" />
              <div className="w-4 h-4 rounded border transition-all flex items-center justify-center"
                   style={{ borderColor: agreed ? "#7C3AED" : "rgba(255,255,255,0.2)", background: agreed ? "#7C3AED" : "transparent" }}>
                {agreed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>
              I agree to the{" "}
              <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Service</a>
              {" "}&amp;{" "}
              <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" disabled={loading} className={submitBtnCls}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><Spinner /> Creating account…</span>
              : "Create Account →"
            }
          </button>
        </form>

        <SocialButtons loading={socialLoading} onSelect={handleSocial} />

        <p className="text-center text-sm mt-7" style={{ color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Sign In
          </Link>
        </p>
      </AuthCard>
    </>
  );
}
