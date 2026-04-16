import Link from 'next/link';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-10">
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#1E3A5F"/>
            <path d="M20 8L30 14V22L20 28L10 22V14L20 8Z" fill="#3B82F6" opacity="0.8"/>
            <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" fill="#22C55E" opacity="0.9"/>
          </svg>
          <span className="font-bold text-white">SmartChain Hub</span>
        </div>
        <nav className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About</Link>
          <Link href="/features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
          <Link href="/documentation" className="text-sm text-gray-400 hover:text-white transition-colors">Documentations</Link>
          <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link>
          <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">Twitter</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center">
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} SmartChain Hub. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
