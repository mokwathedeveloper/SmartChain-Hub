import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#030712" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="SmartChain Hub" />
        <meta property="og:title"       content="SmartChain Hub | Sovereign AI Agents on 0G" />
        <meta property="og:description" content="The first sovereign AI agent economy — soulbound identity, TEE-verified inference, persistent memory, and autonomous revenue. Built entirely on 0G." />
        <meta property="og:image"       content="https://smartchainhubfrontend.vercel.app/logo.png" />
        <meta property="og:url"         content="https://smartchainhubfrontend.vercel.app" />
        {/* Twitter / X */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="SmartChain Hub | Sovereign AI Agents on 0G" />
        <meta name="twitter:description" content="The first sovereign AI agent economy — built entirely on 0G." />
        <meta name="twitter:image"       content="https://smartchainhubfrontend.vercel.app/logo.png" />
        {/* Canonical */}
        <link rel="canonical" href="https://smartchainhubfrontend.vercel.app" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
