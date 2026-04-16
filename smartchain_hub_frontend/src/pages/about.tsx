import Head from "next/head";
import Link from "next/link";

const team = [
  { name: "Alex Rivet", role: "AI Research Lead" },
  { name: "Sarah Chen", role: "Blockchain Architect" },
  { name: "Marcus Thorne", role: "Full Stack Engineer" },
  { name: "Elena Voss", role: "UX Designer" },
  { name: "James Park", role: "Smart Contract Dev" },
];

const AvatarPlaceholder = ({ seed }: { seed: number }) => {
  const colors = ["#818CF8","#60A5FA","#34D399","#F472B6","#FBBF24"];
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: colors[seed % colors.length] }}>
      {["AR","SC","MT","EV","JP"][seed]}
    </div>
  );
};

const ChartSVG = () => (
  <svg viewBox="0 0 300 120" className="w-full">
    <defs>
      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    <path d="M0,100 C30,80 60,60 90,50 C120,40 150,55 180,35 C210,15 240,25 270,10 L270,120 L0,120 Z" fill="url(#chartGrad)"/>
    <path d="M0,100 C30,80 60,60 90,50 C120,40 150,55 180,35 C210,15 240,25 270,10" fill="none" stroke="#818CF8" strokeWidth="2.5"/>
  </svg>
);

export default function About() {
  return (
    <>
      <Head><title>About Us | SmartChain Hub</title></Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 max-w-lg">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Our Mission</h1>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Empowering decentralized commerce through AI-driven automation and blockchain technology to create a trustless environment.
              </p>
              <Link href="/signup" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                Get Started
              </Link>
            </div>
            {/* Team photo grid */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-3">
                {team.slice(0, 3).map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100">
                    <AvatarPlaceholder seed={i} />
                    <p className="text-xs font-bold text-gray-700 mt-2 text-center">{m.name}</p>
                    <p className="text-xs text-gray-400 text-center">{m.role}</p>
                  </div>
                ))}
                {team.slice(3, 5).map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-sm border border-gray-100">
                    <AvatarPlaceholder seed={i + 3} />
                    <p className="text-xs font-bold text-gray-700 mt-2 text-center">{m.name}</p>
                    <p className="text-xs text-gray-400 text-center">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission + Our Technology */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Our Mission */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                SmartChain Hub is dedicated to revolutionizing digital commerce by bridging the gap between advanced AI intelligence and decentralized blockchain security. We believe that autonomous systems should work for people — reducing friction, cutting costs, and ensuring every transaction is transparent and fair.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden">
                <ChartSVG />
              </div>
            </div>

            {/* Our Technology */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Technology</h2>
              <div className="space-y-4">
                {[
                  { icon: "⛓️", title: "Blockchain Integration", desc: "Secure, tamper-proof transactions on 0G Chain with full auditability and smart contract automation." },
                  { icon: "🤖", title: "AI Intelligence", desc: "Self-learning agents that optimize transaction routes, fees, and timing in real-time." },
                  { icon: "🌐", title: "0G Ecosystem", desc: "Leveraging 0G Storage and 0G Compute for decentralized data management and AI processing." },
                ].map((tech) => (
                  <div key={tech.title} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">{tech.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{tech.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
