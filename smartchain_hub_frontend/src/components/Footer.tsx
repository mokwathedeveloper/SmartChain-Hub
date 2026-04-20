import Link from 'next/link';

const Footer = () => (
  <footer className="bg-gray-950 border-t border-gray-800">
    <div className="container mx-auto px-6 max-w-6xl py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        {/* Brand column */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="white" opacity="0.9"/>
                <path d="M20 12L28 16.5V25.5L20 30L12 25.5V16.5L20 12Z" fill="#3B82F6"/>
              </svg>
            </div>
            <span className="font-bold text-white">SmartChain Hub</span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Sovereign AI agents with on-chain identity, persistent memory, and TEE-verified intelligence on 0G.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href="https://twitter.com/SmartChainHub" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com/mokwathedeveloper/SmartChain-Hub" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://discord.gg/0glabs" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product links */}
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Product</p>
          <ul className="space-y-2.5">
            {[
              { label: "Features", href: "/features" },
              { label: "Documentation", href: "/documentation" },
              { label: "Blog", href: "/blog" },
              { label: "Changelog", href: "/blog" },
            ].map(l => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Company</p>
          <ul className="space-y-2.5">
            {[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "GitHub", href: "https://github.com/mokwathedeveloper/SmartChain-Hub" },
              { label: "0G Hackathon", href: "https://hackquest.io" },
            ].map(l => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 0G Stack */}
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">0G Stack</p>
          <ul className="space-y-2.5">
            {[
              { label: "0G Chain", href: "https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08", dot: "bg-blue-500" },
              { label: "0G Compute", href: "https://docs.0g.ai/build-with-0g/compute-network", dot: "bg-purple-500" },
              { label: "0G Storage", href: "https://docs.0g.ai/build-with-0g/storage-sdk", dot: "bg-green-500" },
              { label: "Agent ID", href: "https://scan-testnet.0g.ai/address/0x69C619374c6B901b99941Df7238fceb80d7DCd08", dot: "bg-yellow-500" },
            ].map(l => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group">
                  <span className={`w-1.5 h-1.5 rounded-full ${l.dot} shrink-0`}/>
                  {l.label}
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} SmartChain Hub. Built for the 0G APAC Hackathon 2026.
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            0G Galileo Testnet · Live
          </span>
          <span className="text-xs text-gray-700">|</span>
          <span className="text-xs text-gray-600">Chain ID 16602</span>
          <span className="text-xs text-gray-700">|</span>
          <a href="https://scan-testnet.0g.ai/address/0xf95A1610be22046c334E3bD1b11D2B88519E6C52"
            target="_blank" rel="noreferrer"
            className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
            ChainScan ↗
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
