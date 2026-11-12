import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/branding/logo';

const navLinks = [
  { href: '#how-it-works', label: 'The workflow' },
  { href: '#simple-by-design', label: 'Why Studium' },
];

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="Studium home"
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Logo size="sm" theme="inverse" showTagline tagline="Study from source" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md text-sm font-medium text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-warm-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-lg px-4 text-sm font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-warm-900 transition-colors duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-warm-900"
          >
            Open Studium
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
