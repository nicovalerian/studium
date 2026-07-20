import Link from 'next/link';
import {
  ArrowRight,
  ArrowUp,
  FileText,
  Layers,
  MessageCircle,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { Logo } from '@/components/branding/logo';
import { SiteHeader } from '@/components/landing/site-header';

function HeroProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-warm-100 p-2 shadow-[0_48px_120px_-36px_rgba(0,0,0,.75)]">
      <div className="flex min-h-[31rem] flex-col overflow-hidden rounded-[1.3rem] bg-warm-100 text-warm-900 sm:min-h-[34rem]">
        <div className="flex h-16 shrink-0 items-center justify-between bg-warm-900 px-4 text-white sm:px-5">
          <Logo size="sm" theme="inverse" showTagline tagline="Study from source" />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-[10px] font-semibold text-white/85 sm:inline-flex">
              Sign in
            </span>
            <span className="rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-white">
              Create account
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-b border-primary/10 bg-secondary/70 px-4 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-warm-800">Guest preview is live</div>
            <div className="truncate text-[9px] text-warm-500">
              Explore the workspace first. Sign in when you are ready to continue.
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-2 bg-warm-100 p-2">
          <aside className="hidden w-[35%] shrink-0 flex-col overflow-hidden rounded-xl border border-warm-200 bg-white sm:flex">
            <div className="grid grid-cols-2 gap-1 border-b border-warm-200 bg-warm-50 p-1.5">
              <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-semibold text-primary shadow-sm ring-1 ring-warm-200">
                <FileText className="h-3.5 w-3.5" /> Documents
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold text-warm-500">
                <Layers className="h-3.5 w-3.5" /> Flashcards
              </div>
            </div>

            <div className="relative m-4 rounded-xl border border-dashed border-warm-200 bg-warm-50 px-3 py-7 text-center">
              <Upload className="mx-auto h-6 w-6 text-warm-300" />
              <div className="mt-2 text-[10px] font-semibold text-warm-500">
                Drag & drop a file here
              </div>
              <div className="mt-1 text-[9px] text-warm-400">PDF or DOCX, max 10MB</div>
              <div className="absolute inset-0 rounded-xl bg-white/55 backdrop-blur-[1px]" />
            </div>
            <div className="px-4 text-center text-[9px] text-warm-500">
              Sign in to upload PDFs or DOCX files.
            </div>

            <div className="relative mx-4 mt-4 rounded-xl bg-warm-50 px-3 py-6 text-center">
              <FileText className="mx-auto h-6 w-6 text-warm-300" />
              <div className="mt-2 text-[10px] text-warm-400">No documents uploaded yet</div>
              <div className="absolute inset-0 rounded-xl bg-white/45 backdrop-blur-[1px]" />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-warm-200 bg-white">
            <div className="grid grid-cols-2 gap-1 border-b border-warm-200 bg-warm-50 p-1.5 sm:hidden">
              <div className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-semibold text-primary shadow-sm ring-1 ring-warm-200">
                <FileText className="h-3.5 w-3.5" /> Documents
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold text-warm-500">
                <Layers className="h-3.5 w-3.5" /> Flashcards
              </div>
            </div>

            <div className="flex h-12 shrink-0 items-center justify-between border-b border-warm-200 px-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-primary">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold">Study assistant</div>
                  <div className="hidden text-[9px] text-warm-400 md:block">
                    Answers grounded in your uploaded materials
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-medium text-warm-600">
                <Trash2 className="h-3 w-3" /> Clear chat
              </div>
            </div>

            <div className="app-grid flex min-h-0 flex-1 flex-col items-center justify-center bg-warm-50 px-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-secondary text-primary shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </span>
              <div className="mt-4 font-display text-sm font-semibold">
                Your sources are the starting point
              </div>
              <p className="mt-2 max-w-xs text-[10px] leading-relaxed text-warm-500">
                Upload a course document, then ask for explanations, comparisons, examples, or a
                quick knowledge check.
              </p>
            </div>

            <div className="relative border-t border-warm-200 bg-white p-3">
              <div className="flex min-h-12 items-center rounded-xl border border-warm-200 bg-white px-3 pr-12 text-left text-[10px] font-semibold text-warm-700 shadow-sm">
                Sign in to start chatting with your notes
              </div>
              <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-white blur-[1px]">
                <ArrowUp className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

          <div className="animate-fade-in stagger-4 border-white/12 text-white/52 mt-10 flex max-w-lg items-start gap-3 border-t pt-6 text-sm leading-relaxed opacity-0">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
            Everything stays tied to the material you upload, from the first question to the final
            review.
          </div>
        </div>

        <div className="animate-scale-in stagger-2 relative mx-auto w-full max-w-3xl opacity-0 lg:ml-auto">
          <div className="absolute -inset-8 rounded-full bg-violet-500/10 blur-3xl" />
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}
