import Link from 'next/link';
import { Logo } from '@/components/branding/logo';

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
      { href: '/dashboard', label: 'Start studying' },
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

const linkClass =
  'rounded-md text-warm-600 underline-offset-4 transition-colors hover:text-warm-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-warm-50 py-12 sm:py-16">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="rounded-2xl border border-warm-200 bg-white shadow-raised">
          <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10 lg:py-10">
            <div className="max-w-md">
              <Logo size="md" showTagline />
              <p className="mt-5 text-pretty text-base leading-relaxed text-warm-500">
                Studium is a calmer way to turn class material into useful conversations and
                repeatable review sessions.
              </p>
            </div>

            {footerLinks.map((group) => (
              <div key={group.heading}>
                <h3 className="font-sans text-sm font-semibold text-warm-900">{group.heading}</h3>
                <ul className="mt-4 space-y-3 text-base">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      {'href' in item ? (
                        <Link href={item.href} className={linkClass}>
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-warm-500">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-warm-200 px-6 py-5 text-sm text-warm-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>&copy; {new Date().getFullYear()} Studium. Made for sharper study sessions.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className={linkClass}>
                Home
              </Link>
              <Link href="/login" className={linkClass}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
