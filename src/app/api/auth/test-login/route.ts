import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (process.env.E2E_TESTING !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const testEmail = process.env.TEST_USER_EMAIL;
  if (!testEmail) {
    return NextResponse.json({ error: 'TEST_USER_EMAIL not configured' }, { status: 500 });
  }

  const { email } = await request.json();

  const allowedEmails = [testEmail];
  if (!allowedEmails.includes(email)) {
    return NextResponse.json({ error: 'Email not in allowlist' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: process.env.TEST_USER_PASSWORD!,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}
