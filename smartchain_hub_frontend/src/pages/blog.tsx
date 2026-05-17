import Head from "next/head";
import { useState } from "react";

const posts = [
  {
    slug: "agent-sovereignty-0g",
    category: "Deep Dive",
    categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    title: "What Agent Sovereignty Actually Means on 0G",
    excerpt: "Most AI agents are just wallets with prompts. A truly sovereign agent has an on-chain identity that cannot be cloned by copying a private key. Here's how SmartChain Hub achieves this using 0G's Agent ID standard.",
    date: "Apr 15, 2026",
    readTime: "6 min",
    gradient: "from-blue-600 to-indigo-600",
    icon: "🔐",
    tags: ["Agent ID", "0G Chain", "Sovereignty"],
  },
  {
    slug: "tee-verified-inference",
    category: "Technical",
    categoryColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    title: "TEE-Verified AI Inference: Why It Matters for DeFi",
    excerpt: "When an AI agent optimizes your transaction, how do you know it wasn't manipulated? 0G Compute's TeeML mode runs inference inside a Trusted Execution Environment and signs the result cryptographically. Here's what that means in practice.",
    date: "Apr 10, 2026",
    readTime: "8 min",
    gradient: "from-purple-600 to-blue-600",
    icon: "🛡️",
    tags: ["0G Compute", "TEE", "TeeML"],
  },
  {
    slug: "persistent-memory-0g-storage",
    category: "Tutorial",
    categoryColor: "bg-green-500/10 text-green-400 border-green-500/20",
    title: "Building Persistent Agent Memory with 0G Storage KV",
    excerpt: "95% of AI agent projects store memory in localStorage or a centralized database. We show you how to use 0G Storage's KV layer to give your agent memory that survives browser resets, device switches, and even app rebuilds.",
    date: "Apr 5, 2026",
    readTime: "7 min",
    gradient: "from-green-600 to-teal-600",
    icon: "🧠",
    tags: ["0G Storage", "KV Layer", "Memory"],
  },
  {
    slug: "economic-flywheel-agentic-economy",
    category: "Product",
    categoryColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    title: "The Agentic Economy Flywheel: 3 On-Chain Interactions Per User Action",
    excerpt: "Every optimization on SmartChain Hub generates a storage upload, an Agent ID update, and a revenue event. We break down the economic flywheel that makes this sustainable and why it matters for Track 3 of the 0G APAC Hackathon.",
    date: "Mar 30, 2026",
    readTime: "5 min",
    gradient: "from-yellow-600 to-orange-600",
    icon: "💰",
    tags: ["Economics", "Revenue", "Hackathon"],
  },
  {
    slug: "soulbound-nft-agent-id",
    category: "Technical",
    categoryColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    title: "Designing a Soulbound NFT for AI Agent Identity",
    excerpt: "SmartChainAgentID.sol stores your agent's model hash, memory Merkle root, and reputation score on-chain. It's non-transferable by design. Here's the architecture and why we chose this approach over a standard EOA wallet.",
    date: "Mar 25, 2026",
    readTime: "9 min",
    gradient: "from-indigo-600 to-purple-600",
    icon: "🎭",
    tags: ["Solidity", "NFT", "Agent ID"],
  },
  {
    slug: "tensorflow-transaction-optimizer",
    category: "ML",
    categoryColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    title: "Training a 6-Feature TensorFlow Model for Transaction Optimization",
    excerpt: "Our local fallback model uses 6 features — amount, priority, congestion, time-of-day, and more — to predict optimal transaction routes. We walk through the architecture, training data generation, and why we chose this approach.",
    date: "Mar 20, 2026",
    readTime: "10 min",
    gradient: "from-rose-600 to-pink-600",
    icon: "🤖",
    tags: ["TensorFlow", "ML", "Optimization"],
  },
];

const categories = ["All", "Deep Dive", "Technical", "Tutorial", "Product", "ML"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const featured = posts[0];
  const rest = filtered.slice(activeCategory === "All" ? 1 : 0);

  return (
    <>
      <Head><title>Blog | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gray-950 pt-20 pb-12 border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold mb-5">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
              SmartChain Hub Blog
            </div>
            <h1 className="text-5xl font-black text-white mb-4">
              Insights on AI × Web3
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Deep dives into 0G infrastructure, agent sovereignty, TEE-verified inference, and the agentic economy.
            </p>
          </div>

          {/* Featured post */}
          {activeCategory === "All" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all mb-8">
              <div className={`h-48 bg-gradient-to-br ${featured.gradient} flex items-center justify-center`}>
                <span className="text-7xl">{featured.icon}</span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${featured.categoryColor}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-gray-600">Featured</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-3">{featured.title}</h2>
                <p className="text-gray-400 leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600">{featured.date}</span>
                    <span className="text-xs text-gray-600">{featured.readTime} read</span>
                  </div>
                  <div className="flex gap-2">
                    {featured.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="bg-gray-950 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === c
                    ? "bg-blue-600 text-white"
                    : "bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <div key={post.slug}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group cursor-pointer">
                <div className={`h-32 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{post.icon}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${post.categoryColor}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-600">{post.readTime} read</span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{post.date}</span>
                    <div className="flex gap-1.5">
                      {post.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-600 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-black text-white mb-3">Stay up to date</h3>
            <p className="text-gray-400 mb-6">Get the latest posts on 0G infrastructure, agent sovereignty, and the agentic economy.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"/>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap">
                Subscribe →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
