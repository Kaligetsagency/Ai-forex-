import { DerivWebSocketManager } from './deriv';
import { evaluateStrategy } from './strategy';
import { logSignal } from './db';
import { startServer, broadcastSignal } from './emitter';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.DERIV_APP_ID || '1089';
const token = process.env.DERIV_TOKEN || '';

const manager = new DerivWebSocketManager(appId, token, (asset, c15m, c1h) => {
  console.log(`Processing ${asset} with ${c15m.length} 15m candles and ${c1h.length} 1h candles`);
  const signal = evaluateStrategy(asset, c15m, c1h);
  if (signal) {
    console.log('NEW SIGNAL FOUND:', signal);
    broadcastSignal(signal);
    logSignal(signal).catch(err => console.error('Failed to log signal:', err));
  }
});

startServer();
manager.connect();
manager.subscribeToAsset('R_100');
manager.subscribeToAsset('R_10');
manager.subscribeToAsset('frxEURUSD');

console.log('Scanner started...');
