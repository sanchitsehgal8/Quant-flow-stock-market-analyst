import { AnalyzedDataPoint, AnalysisResult, Recommendation } from '../types';

export const generateRecommendation = (data: AnalyzedDataPoint[]): AnalysisResult => {
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  if (!latest.sma50 || !latest.sma200 || !latest.rsi || !latest.macd || !latest.volatility) {
    return {
      recommendation: Recommendation.HOLD,
      confidence: 0,
      riskLevel: 'HIGH',
      factors: [],
      summary: "Insufficient data to generate a recommendation."
    };
  }

  let score = 0;
  const factors = [];
  
  // 1. Trend Analysis (Weight: 40%)
  const price = latest.close;
  const isAboveSMA200 = price > latest.sma200;
  const isGoldenCross = latest.sma50 > latest.sma200;
  
  if (isAboveSMA200) {
    score += 20;
    factors.push({ name: 'Long-term Trend', impact: 'POSITIVE', description: 'Price is above the 200-day Moving Average, indicating a bullish long-term trend.' });
  } else {
    score -= 20;
    factors.push({ name: 'Long-term Trend', impact: 'NEGATIVE', description: 'Price is below the 200-day Moving Average, indicating a bearish trend.' });
  }

  if (isGoldenCross) {
    score += 10;
    factors.push({ name: 'Golden Cross', impact: 'POSITIVE', description: '50-day SMA is above 200-day SMA.' });
  }

  // 2. Momentum (Weight: 30%)
  // RSI
  if (latest.rsi < 30) {
    score += 20;
    factors.push({ name: 'RSI', impact: 'POSITIVE', description: 'RSI indicates oversold conditions (potential bounce).' });
  } else if (latest.rsi > 70) {
    score -= 20;
    factors.push({ name: 'RSI', impact: 'NEGATIVE', description: 'RSI indicates overbought conditions (potential pullback).' });
  } else {
    factors.push({ name: 'RSI', impact: 'NEUTRAL', description: `RSI is neutral at ${latest.rsi.toFixed(1)}.` });
  }

  // MACD
  if (latest.macd.histogram > 0 && prev.macd && prev.macd.histogram < 0) {
    score += 15;
    factors.push({ name: 'MACD', impact: 'POSITIVE', description: 'MACD Histogram just turned positive (Bullish Crossover).' });
  } else if (latest.macd.histogram > 0) {
    score += 5;
  } else if (latest.macd.histogram < 0) {
    score -= 5;
  }

  // 3. Volatility / Risk (Weight: 30%)
  const riskThreshold = 0.4; // 40% annualized volatility is high
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  
  if (latest.volatility < 0.2) {
    riskLevel = 'LOW';
    score += 10; // Low volatility favors entry
    factors.push({ name: 'Volatility', impact: 'POSITIVE', description: 'Market volatility is low, suggesting stable conditions.' });
  } else if (latest.volatility > riskThreshold) {
    riskLevel = 'HIGH';
    score -= 15; // High volatility penalizes buy score
    factors.push({ name: 'Volatility', impact: 'NEGATIVE', description: 'High volatility detected. Risk is elevated.' });
  } else {
    factors.push({ name: 'Volatility', impact: 'NEUTRAL', description: 'Volatility is within normal bounds.' });
  }

  // Final Decision Logic
  let recommendation = Recommendation.HOLD;
  let confidence = 50;

  // Normalize score (-50 to +50 roughly) to confidence 0-100
  // Base confidence on absolute strength of signal
  const absScore = Math.abs(score);
  confidence = Math.min(Math.round((absScore / 60) * 100), 99);
  
  if (score > 25) {
    recommendation = Recommendation.BUY;
  } else if (score < -25) {
    recommendation = Recommendation.SELL;
  } else {
    recommendation = Recommendation.HOLD;
    confidence = Math.max(confidence, 40); // Holds are usually low confidence directionally
  }

  // Generate Summary
  const summary = `Based on our quantitative model, we recommend a ${recommendation}. The primary drivers are ${factors.filter(f => f.impact !== 'NEUTRAL').slice(0,2).map(f => f.name).join(' and ')}. Risk is assessed as ${riskLevel}.`;

  return {
    recommendation,
    confidence,
    riskLevel,
    factors: factors as any,
    summary
  };
};