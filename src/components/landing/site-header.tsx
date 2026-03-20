import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/branding/logo';

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#simple-by-design', label: 'Why Studium' },
];

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="container mx-auto px-6">
        <div className="mt-6 flex items-center justify-between rounded-full border border-white/60 bg-white/75 px-4 py-3 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <Link href="/" aria-label="Studium home">
            <Logo size="sm" showTagline />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-warm-600 transition-colors hover:text-warm-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-warm-700 transition-colors hover:text-warm-900 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-warm-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-warm-800 hover:shadow-lg"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
