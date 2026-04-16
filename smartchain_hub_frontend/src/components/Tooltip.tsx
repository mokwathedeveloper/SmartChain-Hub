import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-xs font-bold text-white bg-deep-blue rounded-xl shadow-xl w-48 -top-2 left-full ml-2 animate-fade-in border border-white/10">
          {text}
          <div className="absolute w-2 h-2 bg-deep-blue rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
