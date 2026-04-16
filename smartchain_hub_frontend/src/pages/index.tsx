import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>SmartChain Hub | AI-Powered Autonomous Commerce</title>
        <meta name="description" content="Revolutionizing digital commerce with AI agents and 0G Chain technology." />
      </Head>

      <div className="bg-mesh min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-40 lg:pb-56">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-purple/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-deep-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <span className="inline-flex items-center py-1.5 px-4 mb-8 text-xs font-bold tracking-widest text-electric-purple uppercase bg-electric-purple/10 rounded-full border border-electric-purple/20 animate-fade-in shadow-sm">
                <span className="w-2 h-2 bg-electric-purple rounded-full mr-2 animate-pulse"></span>
                Next-Gen 0G Chain Intelligence
              </span>
              <h1 className="text-6xl lg:text-8xl font-black text-deep-blue mb-8 tracking-tighter animate-fade-in-up leading-[0.9]">
                The Future of Commerce is <span className="text-electric-purple">Autonomous</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in-up font-medium" style={{ animationDelay: '0.1s' }}>
                SmartChain Hub deploys proprietary AI agents to automate high-frequency optimizations, 
                slashing transaction fees by up to 40% on the 0G ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Link href="/signup" className="px-10 py-5 bg-deep-blue hover:bg-black text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-2xl hover:shadow-deep-blue/20">
                  Get Started for Free
                </Link>
                <Link href="/about" className="px-10 py-5 glass border-gray-200 text-deep-blue font-bold rounded-2xl transition-all hover:bg-white/50">
                  Read Whitepaper
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* High-Impact Feature Grid */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl lg:text-5xl font-black text-deep-blue mb-6 tracking-tight">Intelligence at Scale</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">We combine the raw power of 0G Chain with the decision-making speed of TensorFlow agents.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "AI Neural Routing", 
                  desc: "Our agents use deep learning to predict the most efficient transaction pathways before network spikes occur.",
                  icon: "🧠",
                  color: "bg-purple-100"
                },
                { 
                  title: "0G Newton Edge", 
                  desc: "Execute transactions with sub-second finality using 0G's high-throughput decentralized storage and compute.",
                  icon: "⚡",
                  color: "bg-blue-100"
                },
                { 
                  title: "Wasm Optimization", 
                  desc: "Performance-critical verification logic written in Rust, ensuring maximum gas efficiency and protocol safety.",
                  icon: "🦀",
                  color: "bg-orange-100"
                }
              ].map((feature, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-all group">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 text-3xl group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-deep-blue mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Numbers Section */}
        <section className="py-24 bg-deep-blue text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {[
                { label: "AI Volume", val: "$420M+" },
                { label: "Avg. Savings", val: "32.4%" },
                { label: "Active Nodes", val: "1,240" },
                { label: "Uptime", val: "99.99%" }
              ].map((stat, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <p className="text-4xl lg:text-6xl font-black mb-2 tracking-tighter">{stat.val}</p>
                  <p className="text-electric-purple font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 container mx-auto px-4">
          <div className="bg-gradient-to-br from-electric-purple to-deep-blue rounded-[3.5rem] p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-tight">Ready to enter the <br/> Autonomous Economy?</h2>
              <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">
                Join 10,000+ pioneers using SmartChain Hub to optimize their digital commerce flow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup" className="px-12 py-6 bg-white text-deep-blue font-black rounded-2xl hover:scale-105 transition-all shadow-2xl">
                  Launch Application
                </Link>
                <Link href="/contact" className="px-12 py-6 bg-transparent border-2 border-white/30 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
