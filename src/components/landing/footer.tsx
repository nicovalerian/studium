import Link from 'next/link';
import { Logo } from '@/components/branding/logo';
import { Reveal } from '@/components/landing/reveal';

interface FooterLinkGroup {
  heading: string;
  items: Array<{
    label: string;
    href?: string;
  }>;
}

const footerLinks = [
  {
    heading: 'Explore',
    items: [
      { href: '#how-it-works', label: 'How it works' },
      { href: '#simple-by-design', label: 'Simple by design' },
      { href: '/login', label: 'Start studying' },
    ],
  },
  {
    heading: 'Why it works',
    items: [
      { label: 'Grounded chat' },
      { label: 'Instant flashcards' },
      { label: 'Focused review flow' },
    ],
  },
] satisfies FooterLinkGroup[];

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-[linear-gradient(180deg,rgba(241,245,249,0.35),white_35%,hsl(var(--warm-50)))] py-16">
      <div className="container mx-auto px-6">
        <Reveal delay={60}>
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_36px_100px_-52px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10 lg:py-10">
              <div className="max-w-md">
                <Logo size="md" showTagline />
                <p className="mt-5 text-base leading-relaxed text-warm-500">
                  Studium is a calmer way to turn class material into useful conversations and
                  repeatable review sessions.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-sm font-medium text-warm-600">
                    Built for learners
                  </span>
                  <span className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-sm font-medium text-warm-600">
                    Grounded in your notes
                  </span>
                </div>
              </div>

              {footerLinks.map((group) => (
                <div key={group.heading}>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-warm-400">
                    {group.heading}
                  </h3>
                  <div className="mt-5 space-y-3">
                    {group.items.map((item) =>
                      'href' in item ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block text-base text-warm-600 transition-colors hover:text-warm-900"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <p key={item.label} className="text-base text-warm-600">
                          {item.label}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-warm-200 px-6 py-5 text-sm text-warm-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <p>&copy; {new Date().getFullYear()} Studium. Made for sharper study sessions.</p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/" className="transition-colors hover:text-warm-900">
                  Home
                </Link>
                <Link href="/login" className="transition-colors hover:text-warm-900">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
