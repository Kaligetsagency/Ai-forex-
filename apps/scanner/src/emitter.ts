import express from 'express';
import { Signal } from '@signal-scanner/types';
import { checkAccess } from './subscriptions';

const app = express();
const PORT = 3001;

let clients: any[] = [];

app.get('/events', async (req, res) => {
  const userId = req.query.userId as string;

  if (!userId || !(await checkAccess(userId))) {
    res.status(403).json({ error: 'Access denied. Active subscription required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    userId,
    res
  };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

export async function broadcastSignal(signal: Signal) {
  const data = JSON.stringify(signal);

  // Only broadcast to clients with active access
  for (const client of clients) {
    if (await checkAccess(client.userId)) {
        client.res.write(`data: ${data}\n\n`);
    } else {
        // Kick client if access expired
        client.res.end();
        clients = clients.filter(c => c.id !== client.id);
    }
  }
}

export function startServer() {
  app.listen(PORT, () => {
    console.log(`Signal Emitter SSE server listening on port ${PORT}`);
  });
}
