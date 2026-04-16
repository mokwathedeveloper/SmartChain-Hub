import Head from "next/head";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name,balance').eq('id', user.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name || ""); }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (authLoading || loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const initials = fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <Head><title>Profile Settings | PayOptimize</title></Head>
      <div className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-3 border-4 border-white shadow-md">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-gray-800">{fullName || 'User'}</h2>
          <p className="text-sm text-gray-400 mb-4">{user?.email}</p>
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Upload New Photo
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-6">Personal Information</h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input type="email" value={user?.email || ''} readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <button type="submit" disabled={saving}
              className={`w-full py-3.5 font-semibold rounded-xl transition-colors text-white ${saved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-60`}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-6">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Change Password</span>
              </div>
              <button className="px-4 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Update Password</button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">Enabled</span>
                <button className="px-4 py-1.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Manage 2FA</button>
              </div>
            </div>
            <div className="pt-2">
              <button onClick={handleLogout} className="w-full py-3 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
