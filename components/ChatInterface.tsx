import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, AnalysisResult, AnalyzedDataPoint } from '../types';
import { generateAnalysisResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  ticker: string;
  data: AnalyzedDataPoint[];
  analysis: AnalysisResult;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ ticker, data, analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Hello! I'm your Quant Assistant. I've analyzed the technicals for ${ticker}. Ask me about the trend, risk factors, or the model's logic.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = {
      ticker,
      currentPrice: data[data.length - 1].close,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      riskLevel: analysis.riskLevel
    };

    // Prepare history for API
    const history = [...messages, userMsg].map(m => ({ role: m.role, text: m.text }));

    const responseText = await generateAnalysisResponse(history, context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/5 flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
          <Bot className="text-indigo-400 h-5 w-5" />
        </div>
        <div>
           <h3 className="font-semibold text-zinc-100">Quant Analyst AI</h3>
           <p className="text-xs text-zinc-500">Powered by Gemini 3</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Sparkles size={14} className="text-cyan-400" />
               </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-bl-none'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
            {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                  <User size={14} className="text-blue-400" />
               </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-3">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                <Sparkles size={14} className="text-cyan-400" />
             </div>
             <div className="bg-zinc-800/50 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 border border-white/5">
                <Loader2 className="animate-spin h-4 w-4 text-cyan-500" />
                <span className="text-zinc-500 text-xs font-medium animate-pulse">Analyzing market data...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about key support levels, trend strength..."
            className="flex-1 bg-zinc-900/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-900/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;