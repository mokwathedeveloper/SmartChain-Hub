import Head from "next/head";
import React from "react";

export default function About() {
  const techStack = [
    { name: "0G Chain", desc: "Modular blockchain for high-performance transactions.", icon: "⛓️" },
    { name: "AI Agents", desc: "Self-learning models for automated optimization.", icon: "🤖" },
    { name: "Supabase", desc: "Secure backend-as-a-service for real-time data.", icon: "⚡" },
    { name: "0G Storage", desc: "Decentralized storage for immutable records.", icon: "📦" }
  ];

  return (
    <>
      <Head>
        <title>About Us | SmartChain Hub</title>
      </Head>
      <div className="bg-white min-h-screen">
        <section className="bg-blue-900 py-20 text-white text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in">Our Mission</h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              SmartChain Hub is dedicated to revolutionizing digital commerce by bridging the gap between 
              advanced AI intelligence and decentralized blockchain security.
            </p>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Revolutionizing Commerce</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Traditional digital commerce is plagued by high fees, slow settlement times, and manual processing. 
                SmartChain Hub leverages the **0G Chain ecosystem** to provide a modular, scalable, and fully 
                autonomous solution.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our AI agents work 24/7 to analyze network conditions, ensuring your transactions are always 
                routed through the most efficient path possible, saving you time and capital.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {techStack.map((tech) => (
                <div key={tech.name} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="text-4xl mb-4">{tech.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{tech.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
