import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Hero Section */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-500">SignalScanner</h1>
        <Link href="/auth" className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Sign In
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
          Master the Markets with <span className="text-blue-500">Precision.</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Get real-time, high-probability trading signals for Forex and Synthetic Indices.
          Our advanced algorithm scans Deriv markets 24/7 so you don't have to.
        </p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">Limited Time Offer</h3>
          <p className="text-gray-300 mb-6">Start your <span className="text-green-400 font-bold">14-Day FREE Trial</span> today!</p>
          <p className="text-sm text-gray-500 mb-8">After trial: 1,000 TSH Daily (Pay via Mobile Money)</p>

          <Link href="/signup" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition transform hover:scale-105">
            Get Started with Phone Number
          </Link>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-12 text-left">
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-blue-500 text-3xl mb-4">📈</div>
            <h4 className="text-xl font-bold mb-2">Trend Following</h4>
            <p className="text-gray-400">Our 200 EMA filter ensures you always trade with the dominant market momentum.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-blue-500 text-3xl mb-4">🎯</div>
            <h4 className="text-xl font-bold mb-2">Perfect Entries</h4>
            <p className="text-gray-400">RSI and MACD confluence helps find the exact moment a trend is ready to continue.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-blue-500 text-3xl mb-4">🛡️</div>
            <h4 className="text-xl font-bold mb-2">Built-in Risk Management</h4>
            <p className="text-gray-400">Every signal comes with automated SL and TP levels based on market volatility.</p>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-gray-800 text-center text-gray-500">
        <p>© 2023 SignalScanner SaaS. Tanzania's #1 Signal Provider.</p>
      </footer>
    </div>
  );
}
