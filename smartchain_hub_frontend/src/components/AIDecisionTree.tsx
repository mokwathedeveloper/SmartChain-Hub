import React from 'react';

const AIDecisionTree = ({ isOptimizing, result, priority }: { isOptimizing: boolean, result: any, priority: string }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-black text-deep-blue tracking-tight">AI Decision Pathway</h3>
        <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-3 py-1 rounded-full uppercase tracking-widest">
          {isOptimizing ? 'Thinking...' : 'Path Verified'}
        </span>
      </div>

      <div className="flex flex-col items-center space-y-8 relative">
        {/* Connection Line */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-100 left-1/2 -translate-x-1/2 z-0"></div>

        {/* Node 1: Input */}
        <div className={`relative z-10 w-full max-w-[200px] p-4 rounded-2xl border-2 text-center transition-all ${isOptimizing ? 'border-electric-purple animate-pulse' : 'border-gray-100 bg-gray-50'}`}>
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Input Data</p>
          <p className="text-xs font-bold text-deep-blue">Transaction Matrix</p>
        </div>

        {/* Node 2: Priority Engine */}
        <div className={`relative z-10 w-full max-w-[240px] p-5 rounded-2xl border-2 shadow-sm transition-all ${isOptimizing ? 'border-gray-100 opacity-50' : 'border-electric-purple bg-white'}`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-lg">🎯</span>
            <p className="text-xs font-black text-deep-blue uppercase tracking-wide">Priority: {priority}</p>
          </div>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Adjusting weights for gas efficiency and route finality.</p>
        </div>

        {/* Node 3: TensorFlow Prediction */}
        <div className={`relative z-10 w-full max-w-[280px] p-6 rounded-[2rem] border-2 shadow-lg transition-all ${isOptimizing ? 'border-gray-100 opacity-50' : 'border-green-500 bg-green-50/50'}`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-black italic">TF</div>
            <p className="text-xs font-black text-green-700 uppercase">Heuristic Prediction</p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-green-200 rounded-full overflow-hidden">
              <div className={`h-full bg-green-500 transition-all duration-1000 ${isOptimizing ? 'w-0' : 'w-[94%]'}`}></div>
            </div>
            <p className="text-[9px] text-green-600 font-bold">Confidence: {result?.confidence || '0'}%</p>
          </div>
        </div>

        {/* Node 4: Final Output */}
        {!isOptimizing && result && (
          <div className="relative z-10 w-full max-w-[240px] p-4 rounded-2xl bg-deep-blue text-white shadow-2xl animate-fade-in-up">
            <p className="text-[10px] font-black opacity-60 uppercase mb-1">Selected Route</p>
            <p className="text-sm font-bold truncate">{result.route}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDecisionTree;
