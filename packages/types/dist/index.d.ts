export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}
export interface Signal {
    asset: string;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    timestamp: number;
}
export declare function calculateEMA(data: number[], period: number): number[];
export declare function calculateRSI(data: number[], period?: number): number[];
export declare function calculateMACD(data: number[], fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
};
