import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LoginButton } from '@/components/auth/login-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/branding/logo';

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.14),transparent_28%),linear-gradient(180deg,hsl(var(--warm-50)),hsl(var(--warm-100)))] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-medium text-warm-700 shadow-sm backdrop-blur transition-colors hover:text-warm-900 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/80 bg-white/90 shadow-[0_42px_120px_-56px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-terracotta via-sage to-sand" />
        <CardHeader className="space-y-5 pt-8 text-center">
          <div className="flex justify-center">
            <Logo size="lg" showTagline />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-warm-900">Welcome back</CardTitle>
            <CardDescription className="text-base text-warm-500">
              Sign in to pick up your next study session right where you left it.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  );
}
