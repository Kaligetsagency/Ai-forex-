import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { phone, pin, action } = await request.json(); // action = 'login' or 'register'

  // Validate inputs
  if (!phone || phone.length !== 10 || !pin || pin.length !== 4) {
    return NextResponse.json({ error: 'Invalid phone (10 digits) or PIN (4 digits).' }, { status: 400 });
  }

  // Translating phone/pin to Supabase email/password format
  const dummyEmail = `${phone}@scanner.local`;
  const password = pin; 

  const supabase = createRouteHandlerClient({ cookies });

  try {
    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password: password,
      });
      if (error) throw error;
      
      // Note: A trigger in your Supabase DB should automatically create a row in 
      // your public.users table here, setting subscription_status to 'trial'.
      
      return NextResponse.json({ message: 'Registration successful', user: data.user });
    } 
    
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });
      if (error) throw error;
      
      return NextResponse.json({ message: 'Login successful', session: data.session });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
