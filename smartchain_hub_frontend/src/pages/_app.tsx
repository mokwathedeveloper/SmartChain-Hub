import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { Web3Provider } from "@/context/Web3Context";
import { NotificationProvider } from "@/context/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

// After an OAuth redirect, apply the rememberMe preference that was saved to
// sessionStorage before the provider bounce. Supabase always writes to
// localStorage on callback — this hook corrects that when the user chose
// session-only (rememberMe = false).
function useOAuthRememberMe() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event !== "SIGNED_IN") return;
      const pref = sessionStorage.getItem("sch-remember-me");
      sessionStorage.removeItem("sch-remember-me");
      if (pref !== "0") return;
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) return;
      sessionStorage.setItem("sch-session", JSON.stringify({
        access_token: s.access_token,
        refresh_token: s.refresh_token,
      }));
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("sb-")) localStorage.removeItem(k);
      });
    });
    return () => subscription.unsubscribe();
  }, []);
}

// Ping the AI agent every 4 minutes while the browser tab is open.
// Render free tier spins down after 15 min of inactivity — this keeps it hot
// during demos and for any active user without relying on paid Vercel crons.
function useAgentKeepAlive() {
  useEffect(() => {
    const ping = () => fetch("/api/keepalive").catch(() => {});
    ping(); // warm immediately on first load
    const id = setInterval(ping, 4 * 60 * 1000); // every 4 minutes
    return () => clearInterval(id);
  }, []);
}

export default function App({ Component, pageProps }: AppProps) {
  useAgentKeepAlive();
  useOAuthRememberMe();

  return (
    <ErrorBoundary>
      <Web3Provider>
        <NotificationProvider>
          <div className={jakarta.className}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </div>
        </NotificationProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
