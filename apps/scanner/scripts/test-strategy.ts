import { evaluateStrategy } from '../src/strategy';

// Mock candles
const candles = [];
let basePrice = 1000;
// 200 EMA will be around 1000
for (let i = 0; i < 200; i++) {
  candles.push({
    time: Date.now() - (300 - i) * 60000,
    open: basePrice,
    high: basePrice + 1,
    low: basePrice - 1,
    close: basePrice
  });
  basePrice += 0.1;
}

// Now price is above EMA200 (~1010 vs ~1005)
// Simulate a dip to trigger RSI < 30
for (let i = 0; i < 20; i++) {
  basePrice -= 2;
  candles.push({
    time: Date.now() - (100 - i) * 60000,
    open: basePrice + 1,
    high: basePrice + 2,
    low: basePrice - 1,
    close: basePrice
  });
}

// Now RSI should be low. Trigger MACD crossover
for (let i = 0; i < 10; i++) {
  basePrice += 1;
  candles.push({
    time: Date.now() - (50 - i) * 60000,
    open: basePrice - 1,
    high: basePrice + 1,
    low: basePrice - 2,
    close: basePrice
  });
  const signal = evaluateStrategy('R_100', candles);
  if (signal) {
    console.log('Signal detected at index', i, ':', signal);
  }
}

if (!evaluateStrategy('R_100', candles)) {
    console.log('No signal detected in mock data');
}
