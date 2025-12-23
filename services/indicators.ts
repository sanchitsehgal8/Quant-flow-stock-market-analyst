import { StockDataPoint, AnalyzedDataPoint, TechnicalIndicators } from '../types';

export const calculateSMA = (data: StockDataPoint[], window: number): (number | null)[] => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      sma.push(null);
      continue;
    }
    const slice = data.slice(i - window + 1, i + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
    sma.push(sum / window);
  }
  return sma;
};

export const calculateRSI = (data: StockDataPoint[], window: number = 14): (number | null)[] => {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }

    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);

    if (i < window) {
      rsi.push(null);
    } else if (i === window) {
      let avgGain = gains / window;
      let avgLoss = losses / window;
      let rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    } else {
      // Smoothed average
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? Math.abs(change) : 0;
      
      // Need to maintain state of prev averages properly for true Wilder's RSI, 
      // but for this demo, a simple window approximation is often acceptable,
      // however, let's try to be closer to standard logic by recalculating on window.
      // Re-calculating full window for simplicity/statelessness in this loop:
      const slice = data.slice(i - window + 1, i + 1);
      let sGains = 0;
      let sLosses = 0;
      for (let j = 1; j < slice.length; j++) {
          const ch = slice[j].close - slice[j-1].close;
          if (ch > 0) sGains += ch;
          else sLosses += Math.abs(ch);
      }
      const avgGain = sGains / window;
      const avgLoss = sLosses / window;
      
      if (avgLoss === 0) {
          rsi.push(100);
      } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  return rsi;
};

export const calculateMACD = (data: StockDataPoint[]): ({ macdLine: number; signalLine: number; histogram: number } | null)[] => {
  const shortPeriod = 12;
  const longPeriod = 26;
  const signalPeriod = 9;

  const emaShort = calculateEMA(data, shortPeriod);
  const emaLong = calculateEMA(data, longPeriod);

  const macdLine = emaShort.map((s, i) => (s !== null && emaLong[i] !== null) ? s - emaLong[i]! : null);
  
  // Calculate Signal Line (9-day EMA of MACD Line)
  // We need to strip nulls to calc EMA of MACD, then re-align
  const validMacdValues = macdLine.filter((v): v is number => v !== null);
  const nullCount = macdLine.length - validMacdValues.length;
  
  // Helper for array of numbers
  const calculateArrayEMA = (arr: number[], window: number): number[] => {
      const k = 2 / (window + 1);
      const emaArr: number[] = [arr[0]];
      for(let i=1; i<arr.length; i++) {
          emaArr.push(arr[i] * k + emaArr[i-1] * (1 - k));
      }
      return emaArr;
  };

  const signalLineValues = calculateArrayEMA(validMacdValues, signalPeriod);
  
  const result = [];
  for (let i = 0; i < macdLine.length; i++) {
      if (i < nullCount) {
          result.push(null);
      } else {
          const m = macdLine[i]!;
          const s = signalLineValues[i - nullCount];
          result.push({
              macdLine: m,
              signalLine: s,
              histogram: m - s
          });
      }
  }
  return result;
};

const calculateEMA = (data: StockDataPoint[], window: number): (number | null)[] => {
  const k = 2 / (window + 1);
  const ema = [];
  let prevEma = data[0].close; // Initialize with SMA ideally, but first price is ok for approx
  
  // First window-1 are null for strictness, or valid
  // Common practice: SMA for first point, then EMA
  // Simplification: Start EMA from index 0
  ema.push(prevEma);
  
  for (let i = 1; i < data.length; i++) {
    const current = data[i].close;
    const newEma = current * k + prevEma * (1 - k);
    ema.push(newEma);
    prevEma = newEma;
  }
  // Fill nulls if we want to align with other indicators requiring window
  // But EMA technically valid from start. We will return as is.
  return ema;
};

export const calculateVolatility = (data: StockDataPoint[], window: number = 20): (number | null)[] => {
    // Standard deviation of returns
    const volatility = [];
    for(let i=0; i<data.length; i++) {
        if(i < window) {
            volatility.push(null);
            continue;
        }
        const slice = data.slice(i-window+1, i+1);
        const returns = slice.slice(1).map((d, idx) => Math.log(d.close / slice[idx].close));
        
        const mean = returns.reduce((a,b) => a+b, 0) / returns.length;
        const variance = returns.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        // Annualize (sqrt(252))
        volatility.push(Math.sqrt(variance) * Math.sqrt(252));
    }
    return volatility;
}

export const analyzeData = (rawData: StockDataPoint[]): AnalyzedDataPoint[] => {
  const sma20 = calculateSMA(rawData, 20);
  const sma50 = calculateSMA(rawData, 50);
  const sma200 = calculateSMA(rawData, 200);
  const rsi = calculateRSI(rawData, 14);
  const macd = calculateMACD(rawData);
  const vol = calculateVolatility(rawData, 20);

  return rawData.map((point, i) => ({
    ...point,
    sma20: sma20[i],
    sma50: sma50[i],
    sma200: sma200[i],
    rsi: rsi[i],
    macd: macd[i],
    volatility: vol[i]
  }));
};