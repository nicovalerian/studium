import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-gradient-to-b from-white to-[hsl(142,76%,97%)] py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(142,76%,36%)] px-6 py-20 text-center shadow-[0_8px_0_hsl(142,76%,28%)] sm:px-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white">
              <Star className="h-4 w-4 fill-current" />
              Free Forever
            </div>

            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Ready to ace your exams?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-white/90">
              Join thousands of students who are already studying smarter, not harder. Get started
              with Studium today.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold uppercase tracking-wide text-[hsl(142,76%,36%)] shadow-[0_4px_0_hsl(142,76%,28%)] transition-all duration-150 ease-out hover:translate-y-[2px] hover:shadow-[0_2px_0_hsl(142,76%,28%)] active:translate-y-[4px] active:shadow-none"
              >
                Get Started for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute left-1/4 top-1/2 h-20 w-20 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
