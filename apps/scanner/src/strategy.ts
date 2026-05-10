import { Candle, Signal, calculateEMA, calculateRSI, calculateMACD } from '@signal-scanner/types';

export function evaluateStrategy(
  asset: string,
  candles15m: Candle[],
  candles1h: Candle[]
): Signal | null {
  if (candles15m.length < 200 || candles1h.length < 200) return null;

  // Analysis on 15m for entry
  const closes15m = candles15m.map(c => c.close);
  const ema200_15m = calculateEMA(closes15m, 200);
  const rsi14_15m = calculateRSI(closes15m, 14);
  const macd15m = calculateMACD(closes15m, 12, 26, 9);

  // Analysis on 1h for trend confirmation
  const closes1h = candles1h.map(c => c.close);
  const ema200_1h = calculateEMA(closes1h, 200);

  const last15m = candles15m.length - 1;
  const last1h = candles1h.length - 1;

  const currentPrice = closes15m[last15m];

  // Rule 1: Trend Filter (200 EMA) - Confirmed on both timeframes
  const isUptrend = currentPrice > ema200_15m[last15m] && closes1h[last1h] > ema200_1h[last1h];
  const isDowntrend = currentPrice < ema200_15m[last15m] && closes1h[last1h] < ema200_1h[last1h];

  // Rule 2: Pullback (RSI) on 15m
  const isOversold = rsi14_15m.slice(-5).some(v => v < 30);
  const isOverbought = rsi14_15m.slice(-5).some(v => v > 70);

  // Rule 3: Trigger (MACD Crossover) on 15m
  const currentMACD = macd15m.macdLine[last15m];
  const currentSignal = macd15m.signalLine[last15m];
  const prevMACD = macd15m.macdLine[last15m - 1];
  const prevSignal = macd15m.signalLine[last15m - 1];

  const macdBullishCross = prevMACD <= prevSignal && currentMACD > currentSignal;
  const macdBearishCross = prevMACD >= prevSignal && currentMACD < currentSignal;

  if (isUptrend && isOversold && macdBullishCross) {
    const { stopLoss, takeProfit } = calculateRiskManagement('BUY', candles15m);
    return {
      asset,
      direction: 'BUY',
      entryPrice: currentPrice,
      stopLoss,
      takeProfit,
      timestamp: candles15m[last15m].time
    };
  }

  if (isDowntrend && isOverbought && macdBearishCross) {
    const { stopLoss, takeProfit } = calculateRiskManagement('SELL', candles15m);
    return {
      asset,
      direction: 'SELL',
      entryPrice: currentPrice,
      stopLoss,
      takeProfit,
      timestamp: candles15m[last15m].time
    };
  }

  return null;
}

function calculateRiskManagement(direction: 'BUY' | 'SELL', candles: Candle[]): { stopLoss: number, takeProfit: number } {
  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle.close;

  let stopLoss: number;
  let takeProfit: number;

  const lookback = 10;
  const recentCandles = candles.slice(-lookback);

  if (direction === 'BUY') {
    const minLow = Math.min(...recentCandles.map(c => c.low));
    stopLoss = Math.min(minLow, currentPrice * 0.995);
    const risk = currentPrice - stopLoss;
    takeProfit = currentPrice + (risk * 2);
  } else {
    const maxHigh = Math.max(...recentCandles.map(c => c.high));
    stopLoss = Math.max(maxHigh, currentPrice * 1.005);
    const risk = stopLoss - currentPrice;
    takeProfit = currentPrice - (risk * 2);
  }

  return { stopLoss, takeProfit };
}
