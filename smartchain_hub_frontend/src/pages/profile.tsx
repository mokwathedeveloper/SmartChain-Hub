import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

/* ── tiny reusable input ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-4 py-3 bg-gray-800 border border-white/[0.07] rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
const INPUT_DISABLED = "w-full px-4 py-3 bg-gray-800/50 border border-white/[0.04] rounded-xl text-sm text-gray-500 cursor-not-allowed";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── profile state ── */
  const [fullName, setFullName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  /* ── password modal state ── */
  const [showPwModal, setShowPwModal]   = useState(false);
  const [currentPw, setCurrentPw]       = useState("");
  const [newPw, setNewPw]               = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [pwError, setPwError]           = useState("");
  const [pwSaving, setPwSaving]         = useState(false);
  const [pwSaved, setPwSaved]           = useState(false);
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  /* ── 2FA state ── */
  const [twoFA, setTwoFA]       = useState(false);
  const [twoFASaving, setTwoFASaving] = useState(false);

  /* ── load profile ── */
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,phone,avatar_url,two_fa_enabled").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setAvatarUrl(data.avatar_url || null);
          setTwoFA(data.two_fa_enabled || false);
        }
        setLoadingProfile(false);
      });
  }, [user]);

  /* ── avatar upload ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    // local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    // upload to supabase storage
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    }
  };

  /* ── save personal info ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, phone, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /* ── change password ── */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setTimeout(() => { setPwSaved(false); setShowPwModal(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }, 2000);
  };

  /* ── toggle 2FA ── */
  const handle2FA = async () => {
    if (!user) return;
    setTwoFASaving(true);
    const next = !twoFA;
    await supabase.from("profiles").update({ two_fa_enabled: next }).eq("id", user.id);
    setTwoFA(next);
    setTwoFASaving(false);
  };

  /* ── logout ── */
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  if (authLoading || loadingProfile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <Head><title>Profile Settings | SmartChain Hub</title></Head>

      {/* ── Password Modal ── */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-white/[0.08] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">Change Password</h3>
              <button onClick={() => { setShowPwModal(false); setPwError(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current password */}
              <Field label="Current Password">
                <div className="relative">
                  <input type={showCurrent ? "text" : "password"} value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" className={INPUT}/>
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showCurrent
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </Field>

              {/* New password */}
              <Field label="New Password">
                <div className="relative">
                  <input type={showNew ? "text" : "password"} value={newPw}
                    onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" className={INPUT}/>
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showNew
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {/* strength bar */}
                {newPw.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                        newPw.length >= n * 3
                          ? n <= 1 ? "bg-red-500" : n <= 2 ? "bg-yellow-500" : n <= 3 ? "bg-blue-500" : "bg-emerald-500"
                          : "bg-gray-700"
                      }`}/>
                    ))}
                  </div>
                )}
              </Field>

              {/* Confirm password */}
              <Field label="Confirm New Password">
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" className={INPUT}/>
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showConfirm
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </Field>

              {pwError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{pwError}</p>}

              <button type="submit" disabled={pwSaving || pwSaved}
                className={`w-full py-3 font-semibold rounded-xl text-sm transition-all ${
                  pwSaved ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                } disabled:opacity-60`}>
                {pwSaving ? "Updating..." : pwSaved ? "✓ Password Updated" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Page ── */}
      <div className="min-h-full flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-5">

          {/* ── Avatar card ── */}
          <div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4 group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-xl">
                {displayAvatar
                  ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                      {initials}
                    </div>
                }
              </div>
              {/* overlay on hover */}
              <button onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-[10px] text-white font-semibold">Change</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
            </div>

            <h2 className="text-lg font-bold text-white">{fullName || "User"}</h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-5">{user?.email}</p>

            <button onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/[0.08] text-white text-sm font-semibold rounded-xl transition-all">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Upload Photo
            </button>
            <p className="text-[11px] text-gray-600 mt-2">JPG, PNG or GIF · Max 2MB</p>
          </div>

          {/* ── Personal Info ── */}
          <div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <Field label="Full Name">
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name" className={INPUT}/>
              </Field>
              <Field label="Email" required>
                <input type="email" value={user?.email || ""} readOnly className={INPUT_DISABLED}/>
                <p className="text-[11px] text-gray-600 mt-1.5">Email cannot be changed here. Contact support.</p>
              </Field>
              <Field label="Phone Number">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900" className={INPUT}/>
              </Field>
              <button type="submit" disabled={saving}
                className={`w-full py-3 font-semibold rounded-xl text-sm transition-all ${
                  saved ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                } disabled:opacity-60 shadow-lg shadow-blue-500/10`}>
                {saving ? "Saving..." : saved ? "✓ Changes Saved" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* ── Security ── */}
          <div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Security Settings</h3>
            <div className="space-y-3">

              {/* Change password row */}
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Password</p>
                    <p className="text-xs text-gray-500">Last changed: never</p>
                  </div>
                </div>
                <button onClick={() => setShowPwModal(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] text-sm text-gray-300 font-medium rounded-lg transition-all">
                  Change
                </button>
              </div>

              {/* 2FA row */}
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    twoFA ? "bg-emerald-500/10 border-emerald-500/20" : "bg-gray-700/30 border-white/[0.05]"
                  }`}>
                    <svg className={`w-4 h-4 ${twoFA ? "text-emerald-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">{twoFA ? "Your account is protected with 2FA" : "Add an extra layer of security"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    twoFA ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-gray-700/50 text-gray-500 border border-white/[0.05]"
                  }`}>
                    {twoFA ? "Enabled" : "Disabled"}
                  </span>
                  {/* toggle switch */}
                  <button onClick={handle2FA} disabled={twoFASaving}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                      twoFA ? "bg-emerald-500" : "bg-gray-700"
                    } disabled:opacity-50`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                      twoFA ? "translate-x-5" : "translate-x-0"
                    }`}/>
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button onClick={handleLogout}
                className="w-full py-3 mt-2 border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/10 text-red-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
