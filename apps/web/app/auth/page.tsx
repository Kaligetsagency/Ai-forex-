'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {step === 'phone' ? 'Welcome Back' : 'Enter OTP'}
        </h2>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 focus:border-blue-500 outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">6-Digit Code</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-center text-2xl tracking-widest focus:border-blue-500 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 py-4 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-400 text-sm"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
