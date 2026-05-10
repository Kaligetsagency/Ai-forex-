-- Create signals_history table
CREATE TABLE signals_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table with subscription info
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  phone_number TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'trial'
  trial_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
