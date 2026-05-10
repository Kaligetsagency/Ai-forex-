declare function calculateEMA(data: number[], period: number): number[];
declare function calculateRSI(data: number[], period?: number): number[];
declare function calculateMACD(data: number[], fastPeriod?: number, slowPeriod?: number, signalPeriod?: number): {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
};
