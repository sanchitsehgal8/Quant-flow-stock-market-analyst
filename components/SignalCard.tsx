import React from 'react';
import { AnalysisResult, Recommendation } from '../types';
import { ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SignalCardProps {
  analysis: AnalysisResult;
}

const SignalCard: React.FC<SignalCardProps> = ({ analysis }) => {
  const { recommendation, confidence, riskLevel, factors, summary } = analysis;

  const getTheme = () => {
    switch (recommendation) {
      case Recommendation.BUY:
        return {
          bg: 'from-emerald-950/40 to-black',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-900/20',
          icon: TrendingUp,
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        };
      case Recommendation.SELL:
        return {
          bg: 'from-rose-950/40 to-black',
          border: 'border-rose-500/20',
          text: 'text-rose-400',
          glow: 'shadow-rose-900/20',
          icon: TrendingDown,
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        };
      case Recommendation.HOLD:
      default:
        return {
          bg: 'from-amber-950/40 to-black',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          glow: 'shadow-amber-900/20',
          icon: Minus,
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className={`rounded-2xl p-6 shadow-2xl h-full flex flex-col bg-gradient-to-b ${theme.bg} border ${theme.border} relative overflow-hidden backdrop-blur-sm`}>
      {/* Background Glow Effect */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${theme.bg.replace('to-black','')} opacity-20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none`}></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Model Verdict</h2>
          <div className={`flex items-center gap-3 mt-1 ${theme.text}`}>
            <Icon size={36} className="drop-shadow-lg" />
            <span className="text-5xl font-bold tracking-tighter drop-shadow-2xl">{recommendation}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Confidence</div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{confidence}%</div>
          {/* Progress Bar for Confidence */}
          <div className="w-20 h-1 bg-zinc-800 rounded-full mt-2 ml-auto overflow-hidden">
             <div className={`h-full rounded-full ${theme.text.replace('text', 'bg')}`} style={{ width: `${confidence}%` }}></div>
          </div>
        </div>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 border tracking-wide uppercase ${
          riskLevel === 'HIGH' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          riskLevel === 'MEDIUM' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
          'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        }`}>
          <ShieldAlert size={14} />
          Risk Level: {riskLevel}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
      </div>

      {/* Factors */}
      <div className="space-y-4 mb-8 flex-grow relative z-10">
        <h3 className="text-zinc-300 font-medium text-sm tracking-wide">Key Drivers</h3>
        {factors.map((factor, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm group">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ring-2 ring-opacity-30 flex-shrink-0 ${
              factor.impact === 'POSITIVE' ? 'bg-emerald-400 ring-emerald-400' : 
              factor.impact === 'NEGATIVE' ? 'bg-rose-400 ring-rose-400' : 'bg-zinc-500 ring-zinc-500'
            }`} />
            <div>
              <span className="text-zinc-200 font-semibold">{factor.name}</span>
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{factor.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-black/30 backdrop-blur-md p-5 rounded-xl border border-white/5 relative z-10">
        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 rounded-l-xl"></div>
        <p className="text-zinc-300 text-sm italic leading-relaxed pl-2">"{summary}"</p>
      </div>
    </div>
  );
};

export default SignalCard;