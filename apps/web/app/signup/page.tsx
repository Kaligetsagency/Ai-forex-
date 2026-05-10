'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    if (password.length !== 4) {
      setError('Password must be exactly 4 digits');
      setLoading(false);
      return;
    }

    // Map phone to virtual email for Supabase Auth
    const email = `${phoneNumber}@scanner.io`;

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
    } else if (data.user) {
        // Automatically start trial for new users in profiles table
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        await supabase.from('profiles').insert([
            {
                id: data.user.id,
                phone_number: phoneNumber,
                subscription_status: 'trial',
                trial_end_date: trialEndDate.toISOString(),
            }
        ]);

        router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">Create Account</h2>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">10-Digit Mobile Number</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              maxLength={10}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 focus:border-blue-500 outline-none"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">4-Digit Password</label>
            <input
              type="password"
              placeholder="****"
              maxLength={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-2xl tracking-[1em] focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up & Start Trial'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link href="/auth" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
