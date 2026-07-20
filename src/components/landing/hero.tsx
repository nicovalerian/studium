import Link from 'next/link';
import { ArrowRight, ArrowUp, FileText, Layers3, MessageCircle, Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/landing/site-header';

export function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-warm-900 text-white">
      <SiteHeader />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/25 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-emerald-400/15 blur-[140px]" />

      <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-14 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:pb-20 lg:pt-28">
        <div className="max-w-2xl">
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Your materials. Your study model.
          </div>

          <h1 className="animate-fade-in stagger-1 mt-7 font-display text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white opacity-0">
            Study what matters.
            <span className="mt-2 block text-violet-300">Skip the noise.</span>
          </h1>

          <p className="animate-fade-in stagger-2 text-white/68 mt-7 max-w-xl text-lg leading-8 opacity-0 sm:text-xl">
            Turn the files already on your desk into grounded answers, useful flashcards, and a
            study loop you can actually stick with.
          </p>

          <div className="animate-fade-in stagger-3 mt-9 flex flex-col gap-3 opacity-0 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-white shadow-[0_16px_50px_-18px_rgba(124,92,255,.9)] transition-all duration-200 hover:bg-violet-500 hover:shadow-[0_20px_55px_-16px_rgba(124,92,255,.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start with your notes
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-6 font-semibold text-white transition-colors duration-200 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              See the workflow
            </Link>
          </div>

          <div className="animate-fade-in stagger-4 border-white/12 mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6 opacity-0">
            {[
              ['PDF + DOCX', 'Sources'],
              ['Grounded', 'Answers'],
              ['One click', 'Flashcards'],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-sm font-semibold text-white">{value}</div>
                <div className="text-white/42 mt-1 text-xs uppercase tracking-[0.16em]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-scale-in stagger-2 relative mx-auto w-full max-w-3xl opacity-0 lg:ml-auto">
          <div className="absolute -inset-8 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#f8f7ff] p-2 shadow-[0_48px_120px_-36px_rgba(0,0,0,.75)]">
            <div className="flex min-h-[34rem] overflow-hidden rounded-[1.3rem] bg-white text-warm-900">
              <aside className="hidden w-44 shrink-0 flex-col bg-warm-900 p-4 text-white sm:flex">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-7 w-7 rounded-lg bg-primary" /> Studium
                </div>
                <div className="mt-9 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Library
                </div>
                <div className="mt-3 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-medium text-white">
                  Cognitive science
                </div>
                <div className="mt-2 px-3 py-2 text-xs text-white/50">Statistics II</div>
                <div className="mt-auto rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-white/55">
                  3 sources ready
                  <br />
                  <span className="text-emerald-300">All indexed</span>
                </div>
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-warm-200 px-5 py-4">
                  <div>
                    <div className="text-xs font-medium text-warm-400">Workspace</div>
                    <div className="font-display font-semibold">Cognitive science</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                    <Layers3 className="h-4 w-4" />
                  </div>
                </div>

                <div className="grid flex-1 lg:grid-cols-[1fr_13rem]">
                  <div className="flex min-w-0 flex-col p-5">
                    <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-warm-400">
                      <MessageCircle className="h-4 w-4 text-primary" /> Ask your sources
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-white">
                      Why does retrieval practice beat rereading?
                    </div>
                    <div className="mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-warm-200 bg-warm-50 px-4 py-3 text-sm leading-relaxed text-warm-700">
                      Your lecture notes explain that retrieval strengthens the path to a memory.
                      Rereading can feel fluent without proving that you can recall the idea
                      independently.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
                        Give me an example
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
                        Make 5 cards
                      </span>
                    </div>
                    <div className="mt-auto flex items-center gap-2 rounded-2xl border border-warm-200 bg-white p-2 shadow-[0_12px_40px_-24px_rgba(45,39,110,.45)]">
                      <span className="flex-1 px-2 text-sm text-warm-400">Ask a follow-up...</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-900 text-white">
                        <ArrowUp className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <aside className="hidden border-l border-warm-200 bg-warm-50 p-4 lg:block">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-400">
                      Sources
                    </div>
                    {['lecture-06.pdf', 'memory-notes.docx', 'study-guide.pdf'].map(
                      (file, index) => (
                        <div
                          key={file}
                          className="mt-3 rounded-xl border border-warm-200 bg-white p-3"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="mt-2 truncate text-xs font-semibold">{file}</div>
                          <div className="mt-1 text-[10px] text-warm-400">
                            {index + 8} pages indexed
                          </div>
                        </div>
                      )
                    )}
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
