import express from 'express';
import { Signal } from '@signal-scanner/types';

const app = express();
const PORT = 3001;

let clients: any[] = [];

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

export function broadcastSignal(signal: Signal) {
  const data = JSON.stringify(signal);
  clients.forEach(c => c.res.write(`data: ${data}\n\n`));
}

export function startServer() {
  app.listen(PORT, () => {
    console.log(`Signal Emitter SSE server listening on port ${PORT}`);
  });
}
