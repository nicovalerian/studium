'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { LoginButton } from '@/components/auth/login-button';
import { useToast } from '@/hooks/use-toast';
import type { AuthMode } from '@/lib/auth/access';

interface AuthPanelProps {
  nextPath: string;
  initialMode: AuthMode;
  initialError?: string | null;
}

function buildCallbackUrl(nextPath: string) {
  const confirmUrl = new URL('/auth/confirm', window.location.origin);
  confirmUrl.searchParams.set('next', nextPath);
  return confirmUrl.toString();
}

function getFriendlyAuthError(message: string) {
  if (/email not confirmed/i.test(message)) {
    return 'Verify your email first, then come back here to sign in.';
  }

  if (/invalid login credentials/i.test(message)) {
    return 'That email and password did not match. If you started with Google, keep using Google for the same account.';
  }

  if (/user already registered/i.test(message)) {
    return 'That email already has a Studium account. Sign in instead. If you originally used Google, continue with Google to reach the same account.';
  }

  return message;
}

export function AuthPanel({ nextPath, initialMode, initialError }: AuthPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(initialError ?? null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const clearMessages = () => {
    setErrorMessage(null);
  };

  const handleResendVerification = async () => {
    const targetEmail = verificationEmail || email.trim();

    if (!targetEmail) {
      setErrorMessage('Add your email first so we know where to resend the verification link.');
      return;
    }

    setIsResending(true);
    clearMessages();

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: buildCallbackUrl(nextPath),
        },
      });

      if (error) {
        throw error;
      }

      setVerificationEmail(targetEmail);
      toast({
        title: 'Verification email resent',
        description: `A fresh verification link is on its way to ${targetEmail}.`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? getFriendlyAuthError(error.message) : 'Failed to resend email.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setVerificationEmail(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setErrorMessage('Add both an email and password to continue.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMessage('Use at least 6 characters for your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (/email not confirmed/i.test(error.message)) {
            setVerificationEmail(trimmedEmail);
          }
          throw error;
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: buildCallbackUrl(nextPath),
        },
      });

      if (error) {
        throw error;
      }

      const identityCount = data.user?.identities?.length ?? 0;
      if (!data.session) {
        if (data.user && identityCount === 0) {
          setMode('signin');
          setErrorMessage(
            'That email already has a Studium account. Sign in instead. If you started with Google, continue with Google to open the same account.'
          );
          return;
        }

        setVerificationEmail(trimmedEmail);
        setPassword('');
        toast({
          title: 'Check your inbox',
          description: `We sent a verification link to ${trimmedEmail}. Once you confirm, you will land in your dashboard.`,
        });
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? getFriendlyAuthError(error.message) : 'Authentication failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Account mode"
        className="grid grid-cols-2 gap-1 rounded-xl border border-warm-200 bg-warm-100 p-1"
      >
        <AnimatedBackground
          value={mode}
          onValueChange={(value) => {
            clearMessages();
            setMode(value as AuthMode);
          }}
          className="rounded-lg bg-white shadow-raised ring-1 ring-warm-200"
        >
          {[
            { id: 'signin', label: 'Sign in' },
            { id: 'signup', label: 'Create account' },
          ].map((tab) => (
            <button
              key={tab.id}
              data-id={tab.id}
              type="button"
              className="flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold text-warm-500 transition-colors hover:text-warm-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:text-primary"
            >
              {tab.label}
            </button>
          ))}
        </AnimatedBackground>
      </div>

      <LoginButton nextPath={nextPath} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-warm-200" />
        </div>
        <div className="relative flex justify-center text-sm text-warm-500">
          <span className="bg-white px-3">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-warm-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? 'auth-error' : undefined}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-warm-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? 'auth-error' : undefined}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === 'signin' ? 'Sign in with email' : 'Create account with email'}
        </Button>
      </form>

      {verificationEmail ? (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Verify your email to unlock Studium</p>
                <p className="mt-1 text-amber-800">
                  We sent a Studium verification link to{' '}
                  <span className="font-medium">{verificationEmail}</span>. Once you confirm it, we
                  will send you straight to the dashboard.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-300"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Resend verification email
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          id="auth-error"
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-warm-500">
        Use the same email for Google and email sign-in to keep everything under one Studium
        account.
      </p>
    </div>
  );
}
