import type { OptimizeResult } from '@/utils/api';

const AIDecisionTree = ({
  isOptimizing,
  result,
  priority,
}: {
  isOptimizing: boolean;
  result: OptimizeResult | null;
  priority: string;
}) => {
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-base font-bold text-white">AI Decision Pathway</h3>
        <span className={isOptimizing ? 'badge-pending' : 'badge-confirmed'}>
          {isOptimizing ? 'Thinking...' : 'Path Verified'}
        </span>
      </div>

      <div className="flex flex-col items-center space-y-6 relative">
        {/* Vertical connector line */}
        <div className="absolute top-0 bottom-0 w-px bg-gray-800 left-1/2 -translate-x-1/2 z-0" />

        {/* Node 1 — Input */}
        <div className={`relative z-10 w-full max-w-[200px] p-4 rounded-2xl border text-center transition-all ${
          isOptimizing
            ? 'border-blue-500/50 bg-blue-500/[0.06] animate-pulse'
            : 'border-gray-700 bg-gray-800/50'
        }`}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Input Data</p>
          <p className="text-sm font-bold text-white">Transaction Matrix</p>
        </div>

        {/* Node 2 — Priority Engine */}
        <div className={`relative z-10 w-full max-w-[240px] p-5 rounded-2xl border transition-all ${
          isOptimizing
            ? 'border-gray-700 bg-gray-800/30 opacity-50'
            : 'border-blue-500/30 bg-blue-500/[0.06]'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-base">🎯</span>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">
              Priority: {priority}
            </p>
          </div>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Adjusting weights for gas efficiency and route finality.
          </p>
        </div>

        {/* Node 3 — TensorFlow Prediction */}
        <div className={`relative z-10 w-full max-w-[280px] p-5 rounded-2xl border transition-all ${
          isOptimizing
            ? 'border-gray-700 bg-gray-800/30 opacity-50'
            : 'border-green-500/30 bg-green-500/[0.06]'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0">
              TF
            </div>
            <p className="text-xs font-bold text-green-300 uppercase tracking-wide">
              Heuristic Prediction
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{ width: isOptimizing ? '0%' : '94%' }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Confidence: {result?.confidence ?? '0'}%
            </p>
          </div>
        </div>

        {/* Node 4 — Final Output */}
        {!isOptimizing && result && (
          <div className="relative z-10 w-full max-w-[240px] p-4 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 animate-slide-up">
            <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">
              Selected Route
            </p>
            <p className="text-sm font-bold text-white truncate">{result.route}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDecisionTree;
