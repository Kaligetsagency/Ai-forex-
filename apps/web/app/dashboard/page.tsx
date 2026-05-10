'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Signal {
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: number;
}

const AVAILABLE_ASSETS = [
  { id: 'R_10', name: 'Volatility 10 Index' },
  { id: 'R_25', name: 'Volatility 25 Index' },
  { id: 'R_50', name: 'Volatility 50 Index' },
  { id: 'R_100', name: 'Volatility 100 Index' },
  { id: 'frxEURUSD', name: 'EUR/USD' },
  { id: 'frxGBPUSD', name: 'GBP/USD' },
];

export default function Dashboard() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const toggleAsset = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleStartScan = () => {
    setIsScanning(true);
  };

  useEffect(() => {
    if (!isScanning) return;

    // Get current user ID from Supabase
    const setupSSE = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsScanning(false);
            return;
        }

        const eventSource = new EventSource(`http://localhost:3001/events?userId=${user.id}`);

        eventSource.onmessage = (event) => {
      try {
        const newSignal: Signal = JSON.parse(event.data);
        // Only show signals for selected assets
        if (selectedAssets.includes(newSignal.asset)) {
            setSignals(prev => [newSignal, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error('Error parsing signal data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
      // Auto-reconnect after 5 seconds
      setTimeout(() => setIsScanning(false), 5000);
    };

        return eventSource;
    };

    let es: EventSource | undefined;
    setupSSE().then(eventSource => {
        if (eventSource) es = eventSource;
    });

    return () => {
      if (es) es.close();
    };
  }, [isScanning, selectedAssets]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 text-blue-500">Scanner Setup</h2>

        <div className="flex-1 space-y-4">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Select Assets</p>
          <div className="space-y-2">
            {AVAILABLE_ASSETS.map(asset => (
              <label key={asset.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  checked={selectedAssets.includes(asset.id)}
                  onChange={() => toggleAsset(asset.id)}
                />
                <span className="text-gray-300">{asset.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartScan}
          disabled={selectedAssets.length === 0 || isScanning}
          className="mt-8 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? 'Scanner Active...' : 'Initiate Scan'}
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Signal Feed</h2>
            <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                <span className="text-sm text-gray-400">{isScanning ? 'Live Scanning' : 'Scanner Idle'}</span>
            </div>
        </div>

        {signals.length === 0 ? (
          <div className="h-64 flex flex-center items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl">
            <p className="text-gray-500 text-center px-4">
                {isScanning
                    ? 'Scanning for high-probability setups... Signals will appear here.'
                    : 'Select assets and click "Initiate Scan" to start.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl hover:border-blue-500 transition animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{AVAILABLE_ASSETS.find(a => a.id === signal.asset)?.name || signal.asset}</h3>
                    <p className="text-xs text-gray-500">{new Date(signal.timestamp * 1000).toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${signal.direction === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {signal.direction}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Price</span>
                    <span className="font-mono">{signal.entryPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss</span>
                    <span className="text-red-400 font-mono">{signal.stopLoss.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit</span>
                    <span className="text-green-400 font-mono">{signal.takeProfit.toFixed(4)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
                   <span className="text-gray-500">Risk/Reward 1:2</span>
                   <button className="text-blue-500 hover:underline">View Chart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
