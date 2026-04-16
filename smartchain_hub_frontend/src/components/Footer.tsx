import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer py-8 bg-gray-900 text-white text-center">
      <div className="container mx-auto px-4">
        <p className="mb-4">&copy; {new Date().getFullYear()} SmartChain Hub. All rights reserved.</p>
        <div className="flex justify-center space-x-6">
          <Link href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
            Twitter
          </Link>
          <Link href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
            GitHub
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
