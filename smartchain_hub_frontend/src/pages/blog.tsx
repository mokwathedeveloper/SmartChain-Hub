import Head from "next/head";
import Link from "next/link";

const posts = [
  {
    title: "How Transforming E-Commerce",
    excerpt: "Discover how SmartChain Hub is revolutionizing e-commerce through AI-driven transaction optimization and blockchain security.",
    date: "Apr 10",
    readTime: "5 min",
    color: "from-blue-400 to-indigo-500",
  },
  {
    title: "The Future of Decentralized",
    excerpt: "Exploring the next frontier of decentralized finance and how autonomous agents are reshaping the digital economy.",
    date: "Apr 5",
    readTime: "4 min",
    color: "from-purple-400 to-blue-500",
  },
  {
    title: "Integrating Blockchain With Future",
    excerpt: "A deep dive into how blockchain integration with AI creates a more secure and efficient transaction ecosystem.",
    date: "Mar 28",
    readTime: "6 min",
    color: "from-indigo-400 to-purple-500",
  },
];

const BlogIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    <defs>
      <linearGradient id="blogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect x="60" y="20" width="55" height="55" rx="8" fill="url(#blogGrad)" opacity="0.8" transform="rotate(10 87 47)"/>
    <rect x="95" y="35" width="50" height="50" rx="8" fill="#60A5FA" opacity="0.55" transform="rotate(-12 120 60)"/>
    <rect x="55" y="65" width="90" height="45" rx="8" fill="#818CF8" opacity="0.4"/>
    <circle cx="100" cy="72" r="18" fill="white" opacity="0.9"/>
    <circle cx="100" cy="72" r="10" fill="url(#blogGrad)" opacity="0.7"/>
  </svg>
);

export default function Blog() {
  return (
    <>
      <Head><title>Blog | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-lg">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4">SmartChain Hub Blog</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Insights on decentralized commerce, blockchain innovation, and AI-driven business automation.
              </p>
              <Link href="/signup" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                Get Started
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-72 h-64">
                <BlogIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-10">New AI Agent Hub</h2>
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.title} className="flex gap-6 border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
                {/* Thumbnail */}
                <div className={`w-32 h-24 rounded-xl bg-gradient-to-br ${post.color} shrink-0 flex items-center justify-center overflow-hidden`}>
                  <svg viewBox="0 0 100 80" className="w-full h-full opacity-80">
                    <rect x="20" y="10" width="30" height="30" rx="4" fill="white" opacity="0.4" transform="rotate(10 35 25)"/>
                    <rect x="45" y="20" width="28" height="28" rx="4" fill="white" opacity="0.3" transform="rotate(-8 59 34)"/>
                    <circle cx="50" cy="40" r="12" fill="white" opacity="0.6"/>
                  </svg>
                </div>
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{post.date}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{post.readTime} read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
