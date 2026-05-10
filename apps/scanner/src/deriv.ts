import WebSocket from 'ws';
import { Candle } from '@signal-scanner/types';

export class DerivWebSocketManager {
  private ws: WebSocket | null = null;
  private appId: string;
  private token: string;
  private onData: (asset: string, candles15m: Candle[], candles1h: Candle[]) => void;
  private assetCandles15m: Map<string, Candle[]> = new Map();
  private assetCandles1h: Map<string, Candle[]> = new Map();
  private subscriptions: Set<string> = new Set();
  private reconnectInterval = 5000;

  constructor(appId: string, token: string, onData: (asset: string, candles15m: Candle[], candles1h: Candle[]) => void) {
    this.appId = appId;
    this.token = token;
    this.onData = onData;
  }

  public connect() {
    this.ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${this.appId}`);

    this.ws.on('open', () => {
      console.log('Connected to Deriv API');
      this.authenticate();
    });

    this.ws.on('message', (data: string) => {
      const response = JSON.parse(data);
      this.handleResponse(response);
    });

    this.ws.on('close', () => {
      console.log('Deriv connection closed. Reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.ws.on('error', (error) => {
      console.error('Deriv WebSocket Error:', error);
    });
  }

  private authenticate() {
    this.ws?.send(JSON.stringify({ authorize: this.token }));
  }

  public subscribeToAsset(asset: string) {
    this.subscriptions.add(asset);
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Subscribe to 15m
      this.ws.send(JSON.stringify({
        ticks_history: asset,
        adjust_start_time: 1,
        count: 500,
        end: 'latest',
        start: 1,
        style: 'candles',
        granularity: 900,
        subscribe: 1,
        req_id: 15
      }));
      // Subscribe to 1h
      this.ws.send(JSON.stringify({
        ticks_history: asset,
        adjust_start_time: 1,
        count: 500,
        end: 'latest',
        start: 1,
        style: 'candles',
        granularity: 3600,
        subscribe: 1,
        req_id: 60
      }));
    }
  }

  private handleResponse(response: any) {
    if (response.msg_type === 'authorize') {
        console.log('Authenticated successfully');
        this.subscriptions.forEach(asset => this.subscribeToAsset(asset));
    }

    if (response.msg_type === 'ohlc') {
      const asset = response.ohlc.symbol;
      const granularity = response.ohlc.granularity;
      const candle: Candle = {
        time: parseInt(response.ohlc.open_time),
        open: parseFloat(response.ohlc.open),
        high: parseFloat(response.ohlc.high),
        low: parseFloat(response.ohlc.low),
        close: parseFloat(response.ohlc.close)
      };

      const map = granularity === 900 ? this.assetCandles15m : this.assetCandles1h;
      let candles = map.get(asset) || [];
      if (candles.length > 0 && candles[candles.length - 1].time === candle.time) {
        candles[candles.length - 1] = candle;
      } else {
        candles.push(candle);
      }

      if (candles.length > 1000) candles.shift();
      map.set(asset, candles);

      this.triggerUpdate(asset);
    }

    if (response.msg_type === 'candles') {
        const asset = response.echo_req.ticks_history;
        const granularity = response.echo_req.granularity;
        const candles: Candle[] = response.candles.map((c: any) => ({
            time: parseInt(c.epoch),
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close)
        }));

        const map = granularity === 900 ? this.assetCandles15m : this.assetCandles1h;
        map.set(asset, candles);
        this.triggerUpdate(asset);
    }
  }

  private triggerUpdate(asset: string) {
    const c15m = this.assetCandles15m.get(asset);
    const c1h = this.assetCandles1h.get(asset);
    if (c15m && c1h) {
        this.onData(asset, c15m, c1h);
    }
  }
}
