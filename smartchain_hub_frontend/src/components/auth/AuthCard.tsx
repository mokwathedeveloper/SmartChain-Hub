import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
         style={{ background: "#06060e" }}>

      {/* Brand ambient orbs — derived from logo gradient */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)" }} />

      {/* Subtle hex grid texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 20 L55 50 L30 65 L5 50 L5 20 Z' fill='none' stroke='%238B5CF6' stroke-width='1'/%3E%3C/svg%3E")`,
             backgroundSize: "60px 60px",
           }} />

      <div className="relative w-full max-w-[420px]">
        {/* Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl"
             style={{
               background: "rgba(10, 10, 20, 0.85)",
               border: "1px solid rgba(255,255,255,0.07)",
               boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
               backdropFilter: "blur(24px)",
             }}>

          {/* Top edge glow — brand gradient */}
          <div className="absolute top-0 left-0 right-0 h-px"
               style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.8) 30%, rgba(6,182,212,0.8) 70%, transparent)" }} />

          <div className="px-8 py-10 sm:px-10 sm:py-12">
            {children}
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 SmartChain Hub · Built on 0G
        </p>
      </div>
    </div>
  );
}
