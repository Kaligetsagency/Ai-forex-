require('dotenv').config();
const express = require('express');
const cors = require('cors');
const derivWS = require('./deriv/wsManager');
const TrendMomentumAlgo = require('./algos/trendMom');
const supabaseService = require('./services/supabase');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Initialize Algo for a specific asset (e.g., Volatility 75 Index)
// In a full build, you'd manage a map of algos for multiple assets
const vol75Algo = new TrendMomentumAlgo('R_75', '15m');

// Store connected frontend clients
let sseClients = [];

// 1. Wire Deriv Data to Algorithm
derivWS.on('history_data', (data) => {
    vol75Algo.initializeData(data.candles);
    console.log(`Initialized historical data for ${vol75Algo.symbol}`);
});

derivWS.on('candle_update', async (ohlc) => {
    const signal = vol75Algo.updateCandle(ohlc);
    
    if (signal) {
        console.log('🚨 SIGNAL GENERATED:', signal);
        
        // Log to Supabase
        await supabaseService.logSignal(signal);

        // Broadcast to all connected Next.js dashboards
        sseClients.forEach(client => {
            client.res.write(`data: ${JSON.stringify(signal)}\n\n`);
        });
    }
});

// Subscribe to asset on startup
setTimeout(() => derivWS.subscribeCandles('R_75', 900), 2000);

// 2. Setup Server-Sent Events (SSE) Endpoint for Next.js
app.get('/api/stream-signals', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    sseClients.push(client);

    req.on('close', () => {
        sseClients = sseClients.filter(c => c.id !== client.id);
    });
});

app.listen(PORT, () => {
    console.log(`Signal Scanner Backend running on port ${PORT}`);
});
