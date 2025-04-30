import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data: tickets, error: ticketError } = await supabase
      .from('tickets')
      .select('id, created_at, from_station, to_station, fare_value, class_value, validity, payment_status');
    
    const { data: challans, error: challanError } = await supabase
      .from('challans')
      .select('id, created_at, reason, fine_amount, payment_status');
    
    if (ticketError || challanError) {
      return res.status(500).json({ error: ticketError || challanError });
    }
    console.log(tickets, challans)
    res.status(200).json({ tickets, challans });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
