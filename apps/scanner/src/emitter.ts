import express from 'express';
import cors from 'cors';
import { Signal } from '@signal-scanner/types';
import { checkAccess } from './subscriptions';

const app = express();
app.use(cors());
const PORT = 3001;

let clients: any[] = [];
const lastSignalTimes = new Map<string, number>();

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

const accessCache = new Map<string, { access: boolean; timestamp: number }>();

async function getCachedAccess(userId: string): Promise<boolean> {
  const cached = accessCache.get(userId);
  const now = Date.now();
  if (cached && now - cached.timestamp < 60000) { // Cache for 1 minute
    return cached.access;
  }
  const access = await checkAccess(userId);
  accessCache.set(userId, { access, timestamp: now });
  return access;
}

export async function broadcastSignal(signal: Signal) {
  // Prevent duplicate signals for the same asset in the same candle
  const signalKey = `${signal.asset}_${signal.direction}`;
  const lastTime = lastSignalTimes.get(signalKey);
  if (lastTime && lastTime === signal.entryPrice) { // Using entryPrice as a proxy for the specific signal instance
    return;
  }
  // Better yet, if we had candle time in signal, we'd use that.
  // Let's assume we don't want to spam the same direction twice in 15 mins
  const now = Date.now();
  if (lastTime && now - lastTime < 60000) { // 1 minute cooldown per asset/direction
    return;
  }
  lastSignalTimes.set(signalKey, now);

  const data = JSON.stringify(signal);

  // Only broadcast to clients with active access
  for (const client of clients) {
    const hasAccess = await getCachedAccess(client.userId);
    if (hasAccess) {
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
