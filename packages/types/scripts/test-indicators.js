const { calculateEMA, calculateRSI, calculateMACD } = require('../dist/index');

// Mock data: Price trending up then down
const prices = [
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
  111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
  121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
  129, 128, 127, 126, 125, 124, 123, 122, 121, 120
];

console.log('EMA (5):', calculateEMA(prices, 5).slice(-5));
console.log('RSI (14):', calculateRSI(prices, 14).slice(-5));
const macd = calculateMACD(prices, 12, 26, 9);
console.log('MACD Line:', macd.macdLine.slice(-5));
console.log('Signal Line:', macd.signalLine.slice(-5));
console.log('Histogram:', macd.histogram.slice(-5));
