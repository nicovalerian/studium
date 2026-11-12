import Link from 'next/link';
import { ArrowRight, Eye, FileText, Layers, Lock, MessageCircle, Trash2 } from 'lucide-react';
import { Logo } from '@/components/branding/logo';
import { SiteHeader } from '@/components/landing/site-header';

/** A static, scaled-down render of the guest workspace. Mirrors class-content.tsx. */
function HeroProductPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of the Studium workspace: a documents panel beside the study assistant chat"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-warm-100 p-1.5 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.7)]"
    >
      <div
        aria-hidden="true"
        className="flex min-h-[31rem] flex-col overflow-hidden rounded-xl bg-warm-100 text-warm-900 sm:min-h-[34rem]"
      >
        <div className="flex h-14 shrink-0 items-center justify-between bg-warm-900 px-4 text-white">
          <Logo size="sm" theme="inverse" />
          <div className="flex items-center gap-1.5">
            <span className="hidden rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white sm:inline-flex">
              Sign in
            </span>
            <span className="rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white">
              Create account
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-warm-200 bg-secondary/60 px-4 py-2">
          <Eye className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="truncate text-[11px] text-warm-600">
            <span className="font-semibold text-warm-800">Guest preview.</span> Sign in to upload,
            chat and generate flashcards.
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-2 bg-warm-100 p-2">
          <aside className="hidden w-[36%] shrink-0 flex-col overflow-hidden rounded-xl border border-warm-200 bg-white sm:flex">
            <div className="grid grid-cols-2 gap-1 border-b border-warm-200 bg-warm-50 p-1.5">
              <div className="flex items-center justify-center gap-1.5 rounded-md bg-white px-2 py-1.5 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-warm-200">
                <FileText className="h-3.5 w-3.5" /> Documents
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold text-warm-500">
                <Layers className="h-3.5 w-3.5" /> Flashcards
              </div>
            </div>

            <div className="m-3 rounded-lg border border-dashed border-warm-300 bg-warm-50 px-3 py-6 text-center">
              <Lock className="mx-auto h-5 w-5 text-warm-400" />
              <div className="mt-2 text-[11px] font-semibold text-warm-700">Sign in to upload</div>
              <div className="mt-0.5 text-[11px] text-warm-500">PDF or DOCX, max 10MB</div>
            </div>

            <div className="mx-3 rounded-lg bg-warm-50 px-3 py-6 text-center">
              <FileText className="mx-auto h-5 w-5 text-warm-300" />
              <div className="mt-2 text-[11px] font-semibold text-warm-700">No documents yet</div>
              <div className="mt-0.5 text-[11px] text-warm-500">Uploads appear here</div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-warm-200 bg-white">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-warm-200 px-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <div className="text-[12px] font-semibold">Study assistant</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-warm-500">
                <Trash2 className="h-3 w-3" /> Clear chat
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-warm-50 px-6 text-center">
              <MessageCircle className="h-7 w-7 text-primary" strokeWidth={1.75} />
              <div className="mt-3 font-display text-sm font-semibold">
                Your sources are the starting point
              </div>
              <p className="mt-1.5 max-w-[16rem] text-[11px] leading-relaxed text-warm-500">
                Upload a course document, then ask for explanations, comparisons, examples, or a
                quick knowledge check.
              </p>
            </div>

            <div className="border-t border-warm-200 bg-white p-2.5">
              <div className="flex min-h-11 items-center gap-2 rounded-lg border border-warm-200 bg-warm-50 px-3 text-left">
                <Lock className="h-3.5 w-3.5 shrink-0 text-warm-500" />
                <span className="flex-1 text-[11px] font-semibold text-warm-700">
                  Sign in to start chatting with your notes
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-warm-900 text-white">
      <SiteHeader />

      <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-14 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:pb-20">
        <div className="max-w-2xl">
          <h1 className="animate-fade-in font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white opacity-0">
            Study what matters.
            <span className="mt-2 block text-[hsl(248_90%_82%)]">Skip the noise.</span>
          </h1>

          <p className="animate-fade-in stagger-1 mt-7 max-w-xl text-pretty text-lg leading-8 text-white/75 opacity-0 sm:text-xl">
            Turn the files already on your desk into grounded answers, useful flashcards, and a
            study loop you can actually stick with.
          </p>

          <div className="animate-fade-in stagger-2 mt-9 flex flex-col gap-3 opacity-0 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-colors duration-200 hover:bg-terracotta-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-warm-900"
            >
              Start with your notes
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-6 font-semibold text-white transition-colors duration-200 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-warm-900"
            >
              See the workflow
            </Link>
          </div>

          <p className="animate-fade-in stagger-3 mt-10 flex max-w-lg items-start gap-3 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/65 opacity-0">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage" aria-hidden="true" />
            Everything stays tied to the material you upload, from the first question to the final
            review.
          </p>
        </div>

        <div className="animate-scale-in stagger-2 relative mx-auto w-full max-w-3xl opacity-0 lg:ml-auto">
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}
