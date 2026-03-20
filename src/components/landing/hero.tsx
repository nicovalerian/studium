import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/landing/site-header';
import { Reveal } from '@/components/landing/reveal';

export function Hero() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,hsl(var(--warm-50)),rgba(255,255,255,0.96)_48%,hsl(var(--warm-100)))]">
      <SiteHeader />

      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[12%] top-24 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute right-[8%] top-32 h-64 w-64 rounded-full bg-sage/15 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sand-light/80 blur-3xl" />
      </div>

      <div className="absolute inset-x-0 top-28 hidden h-px bg-gradient-to-r from-transparent via-warm-200 to-transparent md:block" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />

      <div className="container relative mx-auto flex min-h-[100vh] flex-col items-center justify-center px-6 pb-16 pt-32 sm:pt-36 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in mb-8">
            <span className="badge-warm border border-terracotta/10 bg-white/70 shadow-sm backdrop-blur-sm">
              Notes in. Clarity out.
            </span>
          </div>

          <h1 className="animate-fade-in stagger-1 font-serif text-5xl font-medium leading-[0.96] tracking-tight text-warm-900 opacity-0 sm:text-6xl lg:text-7xl">
            Build calm,
            <br />
            high-signal study sessions
            <br />
            <span className="text-gradient-warm">around your own materials</span>
          </h1>

          <p className="animate-fade-in stagger-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-warm-600 opacity-0 sm:text-xl">
            Turn lecture slides, PDFs, and reading notes into a focused study workspace with
            grounded chat, instant flashcards, and a cleaner review flow.
          </p>

          <div className="animate-fade-in stagger-3 mt-12 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
            <Link
              href="/dashboard"
              className="btn-warm group flex items-center gap-2 rounded-full px-7 text-lg shadow-[0_24px_70px_-34px_rgba(79,70,229,0.8)]"
            >
              Start studying
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="#simple-by-design" className="btn-soft rounded-full border border-white/80 text-lg shadow-sm">
              Explore the flow
            </Link>
          </div>

          <div className="animate-fade-in stagger-4 mt-10 flex flex-wrap items-center justify-center gap-3 opacity-0">
            <span className="rounded-full border border-warm-200 bg-white/75 px-4 py-2 text-sm font-medium text-warm-600 shadow-sm backdrop-blur">
              Grounded AI chat
            </span>
            <span className="rounded-full border border-warm-200 bg-white/75 px-4 py-2 text-sm font-medium text-warm-600 shadow-sm backdrop-blur">
              One-click flashcards
            </span>
            <span className="rounded-full border border-warm-200 bg-white/75 px-4 py-2 text-sm font-medium text-warm-600 shadow-sm backdrop-blur">
              Built for actual coursework
            </span>
          </div>
        </div>

        <Reveal className="mt-20 w-full max-w-5xl" delay={180}>
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_48px_120px_-56px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="border-b border-warm-200 bg-white/90 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-300" />
                  <div className="h-3 w-3 rounded-full bg-amber-300" />
                  <div className="h-3 w-3 rounded-full bg-emerald-300" />
                </div>
                <div className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-warm-500">
                  Study workspace
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1.5fr]">
              <div className="space-y-4 rounded-[1.5rem] border border-warm-200 bg-gradient-to-br from-warm-50 to-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-warm-400">
                      Sources
                    </div>
                    <div className="mt-1 text-lg font-semibold text-warm-900">
                      Lecture week 05
                    </div>
                  </div>
                  <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-sage-dark">
                    Synced
                  </span>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-11 w-11 rounded-2xl bg-terracotta-light" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-warm-800">Cognitive science.pdf</div>
                        <div className="mt-2 h-2.5 w-2/3 rounded-full bg-warm-200" />
                        <div className="mt-2 h-2.5 w-1/2 rounded-full bg-warm-100" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-11 w-11 rounded-2xl bg-sage-light" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-warm-800">Seminar notes.docx</div>
                        <div className="mt-2 h-2.5 w-3/4 rounded-full bg-warm-200" />
                        <div className="mt-2 h-2.5 w-2/5 rounded-full bg-warm-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-warm-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(235,244,255,0.92))] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-warm-400">
                      Guided chat
                    </div>
                    <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-medium text-warm-500 shadow-sm">
                      Context-aware
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[75%] rounded-[1.4rem] rounded-br-md bg-warm-900 px-4 py-3 text-sm text-white shadow-md">
                        Summarize the difference between memory encoding and retrieval.
                      </div>
                    </div>
                    <div className="flex">
                      <div className="max-w-[82%] rounded-[1.4rem] rounded-bl-md border border-warm-200 bg-white px-4 py-3 text-sm leading-relaxed text-warm-700 shadow-sm">
                        Encoding is how information gets stored in memory. Retrieval is the
                        process of accessing it later, and your notes connect both through
                        rehearsal and context cues.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-warm-200 bg-warm-50 p-5 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-warm-400">
                      Flashcards
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-warm-800">
                          What strengthens retrieval cues?
                        </div>
                      </div>
                      <div className="rounded-2xl border border-warm-200 bg-gradient-to-r from-terracotta-light to-sand-light px-4 py-3 text-sm font-medium text-warm-800 shadow-sm">
                        Active recall + spaced repetition
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-warm-200 bg-warm-900 p-5 text-white shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
                      Momentum
                    </div>
                    <div className="mt-4 text-4xl font-semibold tracking-tight">24 min</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Focused review blocks with just enough structure to keep studying moving.
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[72%] rounded-full bg-white" />
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[48%] rounded-full bg-white/70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
