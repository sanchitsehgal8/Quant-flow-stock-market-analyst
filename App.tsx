import React, { useState, useEffect, useMemo } from 'react';
import { StockDataPoint, AnalyzedDataPoint, AnalysisResult } from './types';
import { generateStockData } from './services/marketData';
import { analyzeData } from './services/indicators';
import { generateRecommendation } from './services/decisionEngine';
import StockChart from './components/StockChart';
import IndicatorPanel from './components/IndicatorPanel';
import SignalCard from './components/SignalCard';
import ChatInterface from './components/ChatInterface';
import Visualizer from './components/Visualizer';
import { Search, BarChart3, LayoutDashboard, BrainCircuit, Activity, Lock, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('AAPL');
  const [data, setData] = useState<AnalyzedDataPoint[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');

  useEffect(() => {
    // Check for API Key on mount
    const checkKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for environments without the shim, assume key is ready or handled elsewhere
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        // Assume success to avoid race conditions
        setHasKey(true);
    }
  };

  useEffect(() => {
    if (!hasKey) return;
    
    // Simulate fetching and analyzing
    const rawData = generateStockData(ticker);
    const analyzed = analyzeData(rawData);
    const result = generateRecommendation(analyzed);
    
    setData(analyzed);
    setAnalysis(result);
  }, [ticker, hasKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase());
    }
  };

  // Slice data for view (last 180 days default for chart)
  const viewData = useMemo(() => data.slice(-180), [data]);

  // Lock Screen
  if (!hasKey) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px]" />

        <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20">
                <Lock className="text-white h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">QuantFlow Access</h1>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                This application uses advanced generative models (Gemini 3 Pro) for market analysis and visualization. Please connect a valid API key to proceed.
            </p>
            
            <button 
                onClick={handleSelectKey}
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
            >
                Connect API Key
            </button>

            <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
            >
                Billing Information <ExternalLink size={10} />
            </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-cyan-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Quant<span className="text-cyan-400">Flow</span>
              <span className="ml-2 text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 bg-zinc-800/50 rounded border border-white/5">BETA</span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="relative hidden md:block w-96 group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticker (e.g. NVDA)"
              className="relative w-full bg-zinc-900/80 border border-white/10 text-zinc-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-zinc-600"
            />
            <Search className="absolute left-3 top-3 text-zinc-500 h-4 w-4" />
          </form>

          <nav className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-md border border-white/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
             >
                <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
             </button>
             <button 
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-zinc-800 text-white shadow-md border border-white/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
             >
                <BrainCircuit size={16} /> <span className="hidden sm:inline">Analyst</span>
             </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Ticker Info Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-4xl font-bold text-white tracking-tight">{ticker}</h2>
                    <span className="px-2 py-1 rounded bg-zinc-800 border border-white/5 text-xs text-zinc-400">NASDAQ</span>
                </div>
                <p className="text-zinc-500 text-sm flex items-center gap-2">
                    <Activity size={14} className="text-cyan-500" />
                    Real-time Market Data Simulation
                </p>
            </div>
            <div className="text-left md:text-right">
                <div className="text-4xl font-bold text-white tracking-tight">${data[data.length-1]?.close.toFixed(2)}</div>
                <div className={`text-sm font-medium mt-1 flex items-center md:justify-end gap-1 ${
                    (data[data.length-1]?.close - data[data.length-2]?.close) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                    {(data[data.length-1]?.close - data[data.length-2]?.close) >= 0 ? '▲' : '▼'}
                    {Math.abs(data[data.length-1]?.close - data[data.length-2]?.close).toFixed(2)} (
                    {Math.abs(((data[data.length-1]?.close - data[data.length-2]?.close)/data[data.length-2]?.close)*100).toFixed(2)}%)
                    <span className="text-zinc-500 font-normal ml-1">Today</span>
                </div>
            </div>
        </div>

        {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-6">
                <StockChart data={viewData} />
                <IndicatorPanel data={viewData} />
            </div>

            {/* Right Column: Analysis & Visuals */}
            <div className="space-y-6 flex flex-col">
                {analysis && <div className="flex-shrink-0"><SignalCard analysis={analysis} /></div>}
                
                {analysis && data.length > 0 && (
                    <div className="flex-grow">
                         <Visualizer 
                             context={{
                                 ticker,
                                 currentPrice: data[data.length-1].close,
                                 recommendation: analysis.recommendation,
                                 confidence: analysis.confidence,
                                 riskLevel: analysis.riskLevel
                             }}
                         />
                    </div>
                )}
            </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                <div className="lg:col-span-2 h-full">
                     {analysis && <ChatInterface ticker={ticker} data={data} analysis={analysis} />}
                </div>
                <div className="h-full">
                     {analysis && <SignalCard analysis={analysis} />}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;