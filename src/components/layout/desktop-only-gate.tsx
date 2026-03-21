'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { Logo } from '@/components/branding/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DesktopOnlyGateProps {
  children: React.ReactNode;
  homeHref?: string;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'studium-mobile-workspace-override';

export function DesktopOnlyGate({
  children,
  homeHref = '/',
  storageKey = DEFAULT_STORAGE_KEY,
}: DesktopOnlyGateProps) {
  const [allowMobileView, setAllowMobileView] = useState(false);

  useEffect(() => {
    setAllowMobileView(window.sessionStorage.getItem(storageKey) === 'true');
  }, [storageKey]);

  const continueOnMobile = () => {
    window.sessionStorage.setItem(storageKey, 'true');
    setAllowMobileView(true);
  };

  return (
    <>
      <div className={cn('lg:hidden', allowMobileView && 'hidden')}>
        <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%),linear-gradient(180deg,hsl(var(--warm-50)),hsl(var(--warm-100)))] px-5 py-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

          <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] max-w-md flex-col justify-between">
            <div>
              <Link href={homeHref} aria-label="Back to Studium home" className="inline-flex">
                <Logo size="sm" showTagline tagline="Study with flow" />
              </Link>

              <div className="mt-10 rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_30px_90px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--terracotta-light)),white)] text-primary shadow-sm">
                    <Monitor className="h-7 w-7" />
                  </div>
                  <div className="rounded-full border border-[hsl(var(--sage))/0.18] bg-[hsl(var(--sage-light))] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--sage-dark))]">
                    Desktop first
                  </div>
                </div>

                <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-warm-900">
                  Sorry, this app is only for desktop.
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-warm-600">
                  Studium&apos;s workspace is designed for larger screens so upload, chat, and
                  review can stay clear and usable. Are you sure you want to view it on mobile?
                </p>

                <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-warm-200 bg-[linear-gradient(180deg,white,rgba(241,245,249,0.92))] p-4">
                  <div className="flex items-center gap-3 text-sm text-warm-700">
                    <Monitor className="h-4 w-4 text-primary" />
                    Best experience on a laptop or desktop browser
                  </div>
                  <div className="flex items-center gap-3 text-sm text-warm-700">
                    <Smartphone className="h-4 w-4 text-[hsl(var(--sage-dark))]" />
                    Mobile view may feel cramped and harder to navigate
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Button asChild variant="warm" size="lg" className="w-full rounded-full">
                    <Link href={homeHref}>Back to home</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="warm-outline"
                    size="lg"
                    className="w-full rounded-full"
                    onClick={continueOnMobile}
                  >
                    View on mobile anyway
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="relative mt-6 text-center text-sm text-warm-500">
              You can still continue on this device, but the workspace is intentionally optimized
              for desktop.
            </p>
          </div>
        </div>
      </div>

      <div className={cn('hidden lg:block', allowMobileView && 'block')}>{children}</div>
    </>
  );
}
