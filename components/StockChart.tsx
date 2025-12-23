import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend
} from 'recharts';
import { AnalyzedDataPoint } from '../types';

interface StockChartProps {
  data: AnalyzedDataPoint[];
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  if (data.length === 0) return <div>Loading...</div>;

  return (
    <div className="w-full h-[500px] bg-zinc-900/50 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-50" />
      <h3 className="text-zinc-100 font-semibold mb-6 flex items-center gap-2">
         Price Action <span className="text-zinc-600">|</span> <span className="text-xs text-zinc-400 font-normal uppercase tracking-wider">Daily Candle Close</span>
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} /> {/* Cyan 500 */}
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            tick={{ fontSize: 11, fill: '#71717a' }} 
            tickFormatter={(value) => {
                const d = new Date(value);
                return `${d.getMonth()+1}/${d.getDate()}`;
            }}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#52525b" 
            tick={{ fontSize: 11, fill: '#71717a' }}
            orientation="right"
            tickMargin={10}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: '#a1a1aa', marginBottom: '0.25rem', fontSize: '12px' }}
            cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#a1a1aa' }} />
          
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke="#22d3ee" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClose)" 
            name="Price"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="#a855f7" // Purple 500
            dot={false} 
            strokeWidth={2}
            name="SMA 50"
          />
          <Line 
            type="monotone" 
            dataKey="sma200" 
            stroke="#f97316" // Orange 500
            dot={false} 
            strokeWidth={2}
            name="SMA 200"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;