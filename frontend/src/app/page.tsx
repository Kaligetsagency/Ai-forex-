'use client';

import { useEffect, useState } from 'react';

// Define the Signal TypeScript Interface
interface Signal {
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: string;
  takeProfit: string;
  timestamp: string;
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let eventSource: EventSource;

    if (isScanning) {
      // Connect to your deployed Node.js backend URL (e.g., Railway/Render)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      eventSource = new EventSource(`${backendUrl}/api/stream-signals`);

      eventSource.onmessage = (event) => {
        const newSignal = JSON.parse(event.data);
        // Add new signal to the top of the list
        setSignals((prev) => [newSignal, ...prev]);
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isScanning]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-emerald-400">Signal Scanner Pro</h1>
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`px-6 py-2 rounded-md font-bold transition-colors ${
            isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isScanning ? 'Stop Scanning' : 'Initiate Scan'}
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.length === 0 && isScanning && (
          <p className="text-gray-400 col-span-full text-center mt-10">
            Monitoring market conditions. Waiting for high-probability setups...
          </p>
        )}
        
        {signals.map((sig, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{sig.asset}</h2>
              <span className={`px-3 py-1 rounded text-sm font-bold ${
                sig.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {sig.direction}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-gray-400">Entry:</span> <span>{sig.entryPrice}</span></p>
              <p className="flex justify-between"><span className="text-gray-400">Stop Loss:</span> <span className="text-red-400">{sig.stopLoss}</span></p>
              <p className="flex justify-between"><span className="text-gray-400">Take Profit:</span> <span className="text-green-400">{sig.takeProfit}</span></p>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-right">
              {new Date(sig.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </main>
    </div>
  );
}
