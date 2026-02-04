import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-warm-50 via-warm-100/50 to-warm-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-sage/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand-light blur-3xl" />
      </div>

      <div className="container relative mx-auto flex min-h-[90vh] flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-in mb-8">
            <span className="badge-warm">A new way to study</span>
          </div>

          <h1 className="animate-fade-in stagger-1 font-serif text-5xl font-medium leading-tight tracking-tight text-warm-800 opacity-0 sm:text-6xl lg:text-7xl">
            Your notes deserve
            <br />
            <span className="text-gradient-warm">a conversation</span>
          </h1>

          <p className="animate-fade-in stagger-2 mx-auto mt-8 max-w-xl text-lg leading-relaxed text-warm-500 opacity-0">
            Upload your study materials and have a thoughtful dialogue about what you&apos;re
            learning. Create flashcards that actually stick.
          </p>

          <div className="animate-fade-in stagger-3 mt-12 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
            <Link href="/login" className="btn-warm group flex items-center gap-2 text-lg">
              Start studying
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#how-it-works" className="btn-soft text-lg">
              See how it works
            </Link>
          </div>
        </div>

        <div className="animate-slide-up stagger-4 mt-20 w-full max-w-4xl opacity-0">
          <div className="card-paper overflow-hidden p-0">
            <div className="border-b border-warm-200 bg-warm-100/50 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-warm-300" />
                <div className="h-3 w-3 rounded-full bg-warm-300" />
                <div className="h-3 w-3 rounded-full bg-warm-300" />
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="space-y-3 rounded-lg bg-warm-100/50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-warm-400">
                  Documents
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-8 w-8 rounded bg-terracotta-light" />
                    <div className="flex-1">
                      <div className="h-2 w-20 rounded bg-warm-300" />
                      <div className="mt-1 h-2 w-12 rounded bg-warm-200" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-8 w-8 rounded bg-sage-light" />
                    <div className="flex-1">
                      <div className="h-2 w-24 rounded bg-warm-300" />
                      <div className="mt-1 h-2 w-16 rounded bg-warm-200" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <div className="text-xs font-medium uppercase tracking-wide text-warm-400">
                  Chat
                </div>
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-md bg-terracotta px-4 py-2 text-sm text-white">
                      Explain the key concepts
                    </div>
                  </div>
                  <div className="flex">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-2 text-sm text-warm-700 shadow-sm">
                      Based on your notes, here are the main ideas...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
