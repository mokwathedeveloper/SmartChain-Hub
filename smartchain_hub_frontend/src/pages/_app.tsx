import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { Web3Provider } from "@/context/Web3Context";
import { NotificationProvider } from "@/context/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useEffect } from "react";

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

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
