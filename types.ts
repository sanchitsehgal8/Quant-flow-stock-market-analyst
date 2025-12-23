export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi: number | null;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  } | null;
  volatility: number | null; // Annualized standard deviation
}

export interface AnalyzedDataPoint extends StockDataPoint, TechnicalIndicators {}

export enum Recommendation {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD'
}

export interface AnalysisResult {
  recommendation: Recommendation;
  confidence: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    name: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    description: string;
  }[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum TimeRange {
  '1M' = '1M',
  '6M' = '6M',
  '1Y' = '1Y',
  '2Y' = '2Y',
}
