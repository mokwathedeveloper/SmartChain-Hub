import React from 'react';
import Link from 'next/link';

const FeaturesSection = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-6 max-w-6xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">Platform Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: 'AI Transaction Optimization',
            desc: 'Our TensorFlow-powered agent analyzes network conditions and selects the optimal route, minimizing fees by up to 40%.',
            icon: '🧠',
            href: '/transactions',
            cta: 'Try Optimizer',
          },
          {
            title: 'Blockchain Security',
            desc: 'Every transaction is recorded on 0G Chain via smart contracts, providing tamper-proof, verifiable on-chain receipts.',
            icon: '⛓️',
            href: '/history',
            cta: 'View On-Chain',
          },
          {
            title: 'Revenue Sharing',
            desc: 'Earn 10% of platform fees automatically distributed via smart contracts. Claim your share anytime.',
            icon: '💰',
            href: '/revenue',
            cta: 'View Earnings',
          },
        ].map((f) => (
          <div key={f.title} className="p-8 border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.desc}</p>
            <Link href={f.href} className="text-sm font-semibold text-blue-600 hover:underline">
              {f.cta} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
