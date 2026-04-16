import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { Web3Provider } from "@/context/Web3Context";
import { NotificationProvider } from "@/context/NotificationContext";
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <NotificationProvider>
        <div className={jakarta.className}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </NotificationProvider>
    </Web3Provider>
  );
}
