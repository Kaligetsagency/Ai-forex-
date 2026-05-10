const { EMA, RSI, MACD } = require('technicalindicators');

class TrendMomentumAlgo {
    constructor(symbol, timeframe) {
        this.symbol = symbol;
        this.timeframe = timeframe;
        this.candles = []; // Store historical candles [ { close, high, low, ... } ]
        this.lastSignalTime = null;
    }

    // Called by the WS Manager when historical data arrives
    initializeData(historyData) {
        this.candles = historyData.map(c => ({
            close: c.close,
            high: c.high,
            low: c.low,
            epoch: c.epoch
        }));
    }

    // Called on every new tick/candle update
    updateCandle(ohlc) {
        // Update the latest candle or push a new one
        const lastCandle = this.candles[this.candles.length - 1];
        if (lastCandle && lastCandle.epoch === ohlc.open_time) {
            this.candles[this.candles.length - 1] = { 
                close: parseFloat(ohlc.close), 
                high: parseFloat(ohlc.high), 
                low: parseFloat(ohlc.low), 
                epoch: ohlc.open_time 
            };
        } else {
            this.candles.push({ 
                close: parseFloat(ohlc.close), 
                high: parseFloat(ohlc.high), 
                low: parseFloat(ohlc.low), 
                epoch: ohlc.open_time 
            });
            // Keep array size manageable
            if (this.candles.length > 300) this.candles.shift();
        }

        return this.checkConditions();
    }

    checkConditions() {
        if (this.candles.length < 200) return null; // Not enough data for 200 EMA

        const closes = this.candles.map(c => c.close);
        
        // Calculate Indicators
        const ema200 = EMA.calculate({ period: 200, values: closes });
        const rsi14 = RSI.calculate({ period: 14, values: closes });
        const macd = MACD.calculate({ 
            values: closes, 
            fastPeriod: 12, 
            slowPeriod: 26, 
            signalPeriod: 9, 
            SimpleMAOscillator: false, 
            SimpleMASignal: false 
        });

        // Get latest values
        const currentClose = closes[closes.length - 1];
        const currentEma = ema200[ema200.length - 1];
        const currentRsi = rsi14[rsi14.length - 1];
        
        const currentMacd = macd[macd.length - 1];
        const prevMacd = macd[macd.length - 2];

        // Ensure we don't spam signals for the same candle
        const currentEpoch = this.candles[this.candles.length - 1].epoch;
        if (this.lastSignalTime === currentEpoch) return null;

        let signal = null;

        // Rule 1: BUY Setup
        if (currentClose > currentEma) {
            // Rule 2 & 3: RSI oversold pullback & MACD cross UP
            if (currentRsi < 35 && (prevMacd.MACD < prevMacd.signal && currentMacd.MACD > currentMacd.signal)) {
                signal = this.generatePayload('BUY');
            }
        } 
        // Rule 1: SELL Setup
        else if (currentClose < currentEma) {
            // Rule 2 & 3: RSI overbought pullback & MACD cross DOWN
            if (currentRsi > 65 && (prevMacd.MACD > prevMacd.signal && currentMacd.MACD < currentMacd.signal)) {
                signal = this.generatePayload('SELL');
            }
        }

        if (signal) {
            this.lastSignalTime = currentEpoch;
        }

        return signal;
    }

    generatePayload(direction) {
        const currentPrice = this.candles[this.candles.length - 1].close;
        
        // Risk Management Calculation (Simplified Swing Low/High)
        // In a real scenario, you'd calculate the lowest low of the last 5-10 candles.
        const recentCandles = this.candles.slice(-10);
        let stopLoss, takeProfit;

        if (direction === 'BUY') {
            const swingLow = Math.min(...recentCandles.map(c => c.low));
            stopLoss = swingLow * 0.999; // Slightly below swing low
            const risk = currentPrice - stopLoss;
            takeProfit = currentPrice + (risk * 2); // 1:2 R:R
        } else {
            const swingHigh = Math.max(...recentCandles.map(c => c.high));
            stopLoss = swingHigh * 1.001; // Slightly above swing high
            const risk = stopLoss - currentPrice;
            takeProfit = currentPrice - (risk * 2); // 1:2 R:R
        }

        return {
            asset: this.symbol,
            timeframe: this.timeframe,
            direction,
            entryPrice: currentPrice,
            stopLoss: stopLoss.toFixed(4),
            takeProfit: takeProfit.toFixed(4),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = TrendMomentumAlgo;
