"use strict";
function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    const ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}
function calculateRSI(data, period = 14) {
    const rsi = new Array(data.length).fill(0);
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0)
            gains += diff;
        else
            losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    if (avgLoss === 0) {
        rsi[period] = avgGain === 0 ? 50 : 100;
    }
    else {
        rsi[period] = 100 - 100 / (1 + avgGain / avgLoss);
    }
    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i] - data[i - 1];
        let gain = 0;
        let loss = 0;
        if (diff >= 0)
            gain = diff;
        else
            loss = -diff;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        if (avgLoss === 0) {
            rsi[i] = avgGain === 0 ? 50 : 100;
        }
        else {
            rsi[i] = 100 - 100 / (1 + avgGain / avgLoss);
        }
    }
    return rsi;
}
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);
    const macdLine = fastEMA.map((f, i) => f - slowEMA[i]);
    const signalLine = calculateEMA(macdLine.slice(slowPeriod), signalPeriod);
    // Aligning signalLine with macdLine length
    const fullSignalLine = new Array(slowPeriod).fill(0).concat(signalLine);
    const histogram = macdLine.map((m, i) => m - fullSignalLine[i]);
    return { macdLine, signalLine: fullSignalLine, histogram };
}
