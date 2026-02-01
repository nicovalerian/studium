import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[hsl(220,20%,15%)] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(142,76%,36%)]">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-bold text-white">Studium</span>
          </div>
          <p className="text-sm text-[hsl(220,10%,60%)]">
            &copy; {new Date().getFullYear()} Studium. All rights reserved.
          </p>
          <p className="text-sm text-[hsl(220,10%,60%)]">Built with Next.js, Supabase, and AI</p>
        </div>
      </div>
    </footer>
  );
}
