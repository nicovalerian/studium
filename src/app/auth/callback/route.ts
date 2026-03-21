import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSafeNextPath } from '@/lib/auth/access';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const resolvedOrigin =
    forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}` : origin;
  const code = searchParams.get('code');
  const next = getSafeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, resolvedOrigin));
    }
  }

  const errorUrl = new URL('/login', resolvedOrigin);
  errorUrl.searchParams.set('error', 'auth_failed');
  errorUrl.searchParams.set('next', next);

  return NextResponse.redirect(errorUrl);
}
