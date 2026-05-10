import { DerivWebSocketManager } from '../src/deriv';

const appId = '1089'; // Default demo app id
const token = 'YOUR_TOKEN'; // Would need a real token for full test

const manager = new DerivWebSocketManager(appId, token, (asset, candles) => {
  console.log(`Received ${candles.length} candles for ${asset}`);
});

console.log('DerivWebSocketManager initialized');
// manager.connect(); // Commented out to avoid hanging in CI without real token
