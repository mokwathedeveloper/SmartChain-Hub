import Head from "next/head";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; balance: number; avatar_url?: string } | null>(null);
  const [stats, setStats] = useState({ totalTransactions: 0, totalSavings: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileAndStats();
    }
  }, [user]);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setNewName(profileData.full_name || "");
      }

      const { data: txData } = await supabase
        .from('transactions')
        .select('savings')
        .eq('user_id', user?.id);

      const totalSavings = txData?.reduce((acc, curr) => acc + (Number(curr.savings) || 0), 0) || 0;

      setStats({
        totalTransactions: txData?.length || 0,
        totalSavings: totalSavings
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Profile...</div>;
  }

  return (
    <>
      <Head>
        <title>My Profile | SmartChain Hub</title>
      </Head>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            {/* Profile Header Background */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            
            <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-500 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                      {isEditing ? (
                        <input 
                          type="text"
                          className="w-full border-b-2 border-blue-500 focus:outline-none py-1"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      ) : (
                        profile?.full_name || "Anonymous User"
                      )}
                    </h1>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Savings</p>
                      <p className="text-2xl font-black text-blue-900">${stats.totalSavings.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                      <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Txns</p>
                      <p className="text-2xl font-black text-green-900">{stats.totalTransactions}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Account Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Two-Factor Authentication</p>
                          <p className="text-xs text-gray-400">Add an extra layer of security</p>
                        </div>
                        <button className="text-blue-600 font-bold text-sm">Enable</button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Connected Wallet</p>
                          <p className="text-xs text-gray-400">MetaMask, Phantom, or 0G Wallet</p>
                        </div>
                        <button className="text-blue-600 font-bold text-sm">Connect</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details Sidebar */}
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Profile Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Member Since</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(user?.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Account ID</p>
                        <p className="text-xs text-gray-500 font-mono break-all">{user?.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
