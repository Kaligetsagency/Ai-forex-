import { supabase } from '@signal-scanner/database';

export async function handleSnippeWebhook(payload: any) {
  // Placeholder for Snippe.sh webhook logic
  // Typically Snippe.sh would send a POST request when a payment is successful
  const { userId, status, transactionId } = payload;

  if (status === 'success') {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', userId);

    if (error) console.error('Error updating subscription:', error);
  }
}

export async function checkAccess(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, trial_end_date')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  if (data.subscription_status === 'active') return true;

  if (data.subscription_status === 'trial') {
    const now = new Date();
    const trialEnd = new Date(data.trial_end_date);
    return now < trialEnd;
  }

  return false;
}

export async function startTrial(userId: string) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_status: 'trial',
            trial_end_date: trialEndDate.toISOString()
        })
        .eq('id', userId);

    if (error) console.error('Error starting trial:', error);
}
