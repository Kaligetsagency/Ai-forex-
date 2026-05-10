import { Signal } from '@signal-scanner/types';
import { supabase } from '@signal-scanner/database';

export async function logSignal(signal: Signal) {
  const { data, error } = await supabase
    .from('signals_history')
    .insert([
      {
        asset: signal.asset,
        direction: signal.direction,
        entry_price: signal.entryPrice,
        stop_loss: signal.stopLoss,
        take_profit: signal.takeProfit,
        timestamp: new Date(signal.timestamp * 1000).toISOString(),
      },
    ]);

  if (error) {
    console.error('Error logging signal to Supabase:', error);
  } else {
    console.log('Signal logged to history:', signal.asset, signal.direction);
  }
}

export async function getUserSubscriptionStatus(userId: string): Promise<string> {
    const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching subscription status:', error);
        return 'inactive';
    }
    return data.subscription_status;
}
