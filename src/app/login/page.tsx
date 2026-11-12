import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Check, FileStack, MessageCircle, ShieldCheck } from 'lucide-react';
import { AuthPanel } from '@/components/auth/auth-panel';
import { Logo } from '@/components/branding/logo';
import { getSafeNextPath } from '@/lib/auth/access';

interface LoginPageProps {
  searchParams?: {
    next?: string;
    mode?: string;
    error?: string;
  };
}

const benefits = [
  { icon: FileStack, text: 'Keep every course source in one focused workspace' },
  { icon: MessageCircle, text: 'Ask questions grounded in your own material' },
  { icon: ShieldCheck, text: 'Your workspace stays tied to your account' },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = getSafeNextPath(searchParams?.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(nextPath);

  const initialMode = searchParams?.mode === 'signup' ? 'signup' : 'signin';
  const initialError =
    searchParams?.error === 'auth_failed'
      ? 'That sign-in or verification link expired. Try again from the auth screen.'
      : null;

  return (
    <main
      id="main-content"
      className="grid min-h-svh bg-warm-50 lg:grid-cols-[0.9fr_1.1fr]"
      tabIndex={-1}
    >
      <section className="relative hidden overflow-hidden bg-warm-900 px-10 py-9 text-white lg:flex lg:flex-col">
        <Link
          href="/"
          className="relative z-10 w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Logo size="md" theme="inverse" showTagline tagline="Study from source" />
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white xl:text-6xl">
            Pick up where your notes left off.
          </h1>
          <p className="mt-6 max-w-lg text-pretty text-lg leading-8 text-white/75">
            Sign in to return to your sources, conversations, and flashcard review without
            rebuilding context.
          </p>
          <div className="mt-10 space-y-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 text-white/85">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[hsl(248_90%_82%)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-white/65">
          <Check className="h-4 w-4 text-sage" aria-hidden="true" /> Start as a guest before
          creating an account
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-20 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="absolute left-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-8 sm:top-8"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="md" showTagline tagline="Study from source" />
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.035em] text-warm-900">
            {initialMode === 'signup' ? 'Create your workspace' : 'Continue studying'}
          </h2>
          <p className="mt-3 text-base leading-7 text-warm-500">
            Use Google for the quickest route, or continue with your email.
          </p>
          <div className="mt-8 rounded-2xl border border-warm-200 bg-white p-5 shadow-panel sm:p-7">
            <AuthPanel nextPath={nextPath} initialMode={initialMode} initialError={initialError} />
          </div>
        </div>
      </section>
    </main>
  );
}
