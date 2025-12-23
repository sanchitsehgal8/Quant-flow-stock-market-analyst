import { StockDataPoint } from '../types';

// Helper to generate a random walk with momentum and mean reversion
export const generateStockData = (ticker: string, days: number = 730): StockDataPoint[] => {
  const data: StockDataPoint[] = [];
  
  // Seed price based on ticker hash to be consistent but pseudo-random
  let price = 150.0;
  if (ticker === 'AAPL') price = 175.0;
  if (ticker === 'TSLA') price = 220.0;
  if (ticker === 'NVDA') price = 450.0;

  let trend = 0.0005; // Slight upward bias
  let volatility = 0.02; // 2% daily volatility

  const now = new Date();
  
  // Start from 'days' ago
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Random market shock
    if (Math.random() > 0.98) {
        trend = -trend; // Trend reversal
    }

    const changePercent = (Math.random() - 0.5) * volatility * 2 + trend;
    const change = price * changePercent;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 10000000) + 5000000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    price = close;
  }

  return data;
};