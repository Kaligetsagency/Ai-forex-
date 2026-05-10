const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for backend bypass
const supabase = createClient(supabaseUrl, supabaseKey);

async function logSignal(signalData) {
    try {
        const { data, error } = await supabase
            .from('signals_history')
            .insert([{
                asset: signalData.asset,
                direction: signalData.direction,
                entry_price: signalData.entryPrice,
                stop_loss: signalData.stopLoss,
                take_profit: signalData.takeProfit,
                timeframe: signalData.timeframe
            }]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to log signal to Supabase:', error);
    }
}

module.exports = { logSignal, supabase };
