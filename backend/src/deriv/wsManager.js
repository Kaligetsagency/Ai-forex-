const WebSocket = require('ws');
const EventEmitter = require('events');

const DERIV_APP_ID = process.env.DERIV_APP_ID || '1089'; // Default testing App ID
const DERIV_WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

class DerivWSManager extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.pingInterval = null;
        this.reconnectTimer = null;
        this.subscriptions = new Set();
        this.connect();
    }

    connect() {
        console.log('Connecting to Deriv WebSocket...');
        this.ws = new WebSocket(DERIV_WS_URL);

        this.ws.on('open', () => {
            console.log('Deriv WebSocket Connected.');
            this.startPing();
            this.restoreSubscriptions();
        });

        this.ws.on('message', (data) => {
            const response = JSON.parse(data);
            
            // Route message to appropriate event listeners
            if (response.msg_type === 'ohlc') {
                this.emit('candle_update', response.ohlc);
            } else if (response.msg_type === 'history') {
                this.emit('history_data', response);
            }
        });

        this.ws.on('close', () => this.handleDisconnect());
        this.ws.on('error', (err) => console.error('Deriv WS Error:', err));
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 30000); // Ping every 30s to keep connection alive
    }

    handleDisconnect() {
        console.log('Deriv WebSocket disconnected. Reconnecting in 5s...');
        clearInterval(this.pingInterval);
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }

    subscribeCandles(symbol, granularity = 900) { // 900s = 15m
        const subReq = {
            ticks_history: symbol,
            adjust_start_time: 1,
            count: 250, // Enough to calculate 200 EMA
            end: 'latest',
            start: 1,
            style: 'candles',
            granularity: granularity,
            subscribe: 1
        };
        this.subscriptions.add(JSON.stringify(subReq));
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(subReq));
        }
    }

    restoreSubscriptions() {
        this.subscriptions.forEach(sub => {
            this.ws.send(sub);
        });
    }
}

module.exports = new DerivWSManager();
