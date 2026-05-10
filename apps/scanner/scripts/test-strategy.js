const { evaluateStrategy } = require('../src/strategy');

// Mock candles
const candles = [];
let basePrice = 100;
for (let i = 0; i < 250; i++) {
  // Simulate an uptrend that dips into oversold
  if (i > 200 && i < 220) {
    basePrice -= 0.5;
  } else {
    basePrice += 0.2;
  }

  candles.push({
    time: Date.now() - (250 - i) * 60000,
    open: basePrice - 0.1,
    high: basePrice + 0.2,
    low: basePrice - 0.2,
    close: basePrice
  });
}

// We need to mock @signal-scanner/types since we are running in plain node
// Actually, let's just use the compiled JS from packages/types/dist

const signal = evaluateStrategy('R_100', candles);
console.log('Signal:', signal);
