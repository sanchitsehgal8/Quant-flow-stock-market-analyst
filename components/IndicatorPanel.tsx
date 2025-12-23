import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { AnalyzedDataPoint } from '../types';

interface IndicatorPanelProps {
  data: AnalyzedDataPoint[];
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* RSI Chart */}
      <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl p-5 shadow-xl border border-white/5 h-64">
        <h3 className="text-zinc-400 font-medium mb-4 text-xs uppercase tracking-wider">Momentum (RSI 14)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} stroke="#52525b" orientation="right" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickMargin={5} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#3f3f46' }}
            />
            <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
            <Line type="monotone" dataKey="rsi" stroke="#38bdf8" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MACD Chart */}
      <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl p-5 shadow-xl border border-white/5 h-64">
        <h3 className="text-zinc-400 font-medium mb-4 text-xs uppercase tracking-wider">Trend Strength (MACD)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis stroke="#52525b" orientation="right" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickMargin={5} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
               labelStyle={{ display: 'none' }}
               cursor={{ fill: '#27272a', opacity: 0.5 }}
            />
            <Bar dataKey="macd.histogram" name="Histogram" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.macd && entry.macd.histogram > 0 ? '#34d399' : '#fb7185'} opacity={0.8} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndicatorPanel;