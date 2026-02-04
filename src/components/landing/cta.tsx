import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-gradient-to-b from-white to-warm-100/50 py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warm-800 to-warm-900 px-6 py-16 text-center sm:px-16 sm:py-20">
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              Start learning
              <br />
              <span className="text-warm-300">the way you think</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-warm-300">
              Your notes are waiting to have a conversation. Upload them and see what you discover.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-medium text-warm-800 transition-all duration-200 hover:bg-warm-50 hover:shadow-lg"
              >
                Get started free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-terracotta/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-sage/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
