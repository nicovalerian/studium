import { BookOpen, Layers, MessageCircle, Upload } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Drop your files',
    description:
      'PDFs, lecture slides, and Word docs land in one tidy workspace so you can start studying without any setup friction.',
    icon: Upload,
    accent: 'terracotta',
    className: 'lg:col-span-3',
    eyebrow: 'Quick intake',
    highlights: ['PDF + DOCX support', 'Private processing'],
    visual: 'upload',
  },
  {
    title: 'Ask like a study partner',
    description:
      'Get grounded answers that stay close to your actual notes instead of drifting into generic summaries.',
    icon: MessageCircle,
    accent: 'sage',
    className: 'lg:col-span-3',
    eyebrow: 'Grounded chat',
    highlights: ['Context-aware replies', 'Better follow-up questions'],
    visual: 'chat',
  },
  {
    title: 'Generate flashcards that feel usable',
    description:
      'Turn dense content into clean prompts and answers you can review right away or refine later.',
    icon: Layers,
    accent: 'sand',
    className: 'lg:col-span-2',
    eyebrow: 'Fast conversion',
    highlights: ['Editable cards', 'Structured review'],
    visual: 'cards',
  },
  {
    title: 'Stay in a focused study loop',
    description:
      'Move from upload to chat to review inside one calm interface that keeps the next best step obvious.',
    icon: BookOpen,
    accent: 'terracotta',
    className: 'lg:col-span-4',
    eyebrow: 'Built for momentum',
    highlights: ['Fewer context switches', 'Made for real coursework'],
    visual: 'review',
  },
] as const;

const accentStyles = {
  terracotta: {
    shell:
      'bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.9))] border-terracotta/15',
    icon: 'bg-terracotta text-white shadow-[0_20px_48px_-30px_rgba(79,70,229,0.7)]',
    pill: 'border-terracotta/15 bg-terracotta-light text-terracotta-dark',
  },
  sage: {
    shell:
      'bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,253,245,0.92))] border-sage/15',
    icon: 'bg-sage text-white shadow-[0_20px_48px_-30px_rgba(16,185,129,0.75)]',
    pill: 'border-sage/15 bg-sage-light text-sage-dark',
  },
  sand: {
    shell:
      'bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.92))] border-sand/15',
    icon: 'bg-sand text-white shadow-[0_20px_48px_-30px_rgba(59,130,246,0.65)]',
    pill: 'border-sand/15 bg-sand-light text-warm-700',
  },
} as const;

function FeatureVisual({ visual }: { visual: (typeof features)[number]['visual'] }) {
  switch (visual) {
    case 'upload':
      return (
        <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.4rem] border border-dashed border-warm-300 bg-white/80 p-5">
            <div className="flex h-full flex-col items-center justify-center rounded-[1.1rem] border border-warm-200 bg-warm-50 px-4 py-8 text-center">
              <div className="rounded-full bg-terracotta-light px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-terracotta-dark">
                Drag and drop
              </div>
              <div className="mt-4 max-w-[14rem] text-sm leading-relaxed text-warm-500">
                Drop a lecture deck, an article, or a seminar handout and let Studium sort the
                rest.
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-[1.2rem] border border-warm-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-warm-800">behavioral-econ.pdf</div>
              <div className="mt-2 h-2 w-3/4 rounded-full bg-warm-200" />
            </div>
            <div className="rounded-[1.2rem] border border-warm-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-warm-800">week-7-notes.docx</div>
              <div className="mt-2 h-2 w-1/2 rounded-full bg-warm-200" />
            </div>
            <div className="rounded-[1.2rem] border border-warm-200 bg-warm-900 px-4 py-4 text-sm text-white shadow-sm">
              Everything stays organized by class and ready for the next study session.
            </div>
          </div>
        </div>
      );

    case 'chat':
      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="max-w-[18rem] rounded-[1.35rem] rounded-br-md bg-warm-900 px-4 py-3 text-sm text-white shadow-sm">
              Compare intrinsic and extrinsic motivation from my notes.
            </div>
          </div>
          <div className="flex">
            <div className="max-w-[20rem] rounded-[1.35rem] rounded-bl-md border border-warm-200 bg-white px-4 py-3 text-sm leading-relaxed text-warm-700 shadow-sm">
              Your notes frame intrinsic motivation as internally rewarding, while extrinsic
              motivation depends on outside incentives like grades or deadlines.
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-white/70 bg-white/75 px-4 py-3 text-sm text-warm-500 shadow-sm backdrop-blur">
            Follow-up suggestions: ask for examples, counterpoints, or flashcard prompts.
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="relative flex min-h-[13rem] items-center justify-center overflow-hidden rounded-[1.5rem] border border-warm-200 bg-white p-4">
          <div className="absolute h-36 w-56 rotate-[-9deg] rounded-[1.4rem] border border-warm-200 bg-warm-50 shadow-sm" />
          <div className="absolute h-36 w-56 rotate-[7deg] rounded-[1.4rem] border border-warm-200 bg-sand-light shadow-sm" />
          <div className="relative z-10 flex w-full max-w-[15rem] flex-col overflow-hidden rounded-[1.6rem] border border-warm-200 bg-white px-5 py-4 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.75)]">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-warm-400">
              Card preview
            </div>
            <div className="mt-4 text-base font-semibold leading-snug text-warm-800">
              What makes spaced repetition effective for exam prep?
            </div>
            <div className="mt-4 h-2 w-2/3 rounded-full bg-warm-200" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-warm-100" />
          </div>
        </div>
      );

    case 'review':
      return (
        <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-warm-200 bg-warm-900 p-5 text-white">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
              Session rhythm
            </div>
            <div className="mt-4 text-4xl font-semibold tracking-tight">3 steps</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Upload, clarify, then review without hopping between tools.
            </p>
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-warm-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between rounded-[1.1rem] bg-warm-50 px-4 py-3">
              <span className="text-sm font-medium text-warm-700">Upload source material</span>
              <span className="text-xs uppercase tracking-[0.18em] text-warm-400">01</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.1rem] bg-warm-50 px-4 py-3">
              <span className="text-sm font-medium text-warm-700">Ask grounded questions</span>
              <span className="text-xs uppercase tracking-[0.18em] text-warm-400">02</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.1rem] bg-terracotta-light px-4 py-3">
              <span className="text-sm font-medium text-terracotta-dark">
                Review cards with intent
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-terracotta-dark">03</span>
            </div>
          </div>
        </div>
      );
  }
}

export function Features() {
  return (
    <section
      id="how-it-works"
      className="bg-[linear-gradient(180deg,white,rgba(248,250,252,0.92))] py-24 sm:py-32"
    >
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto max-w-3xl scroll-mt-28 text-center" delay={40}>
          <div id="simple-by-design">
            <span className="badge-sage">Simple by design</span>
            <h2 className="mt-6 font-serif text-4xl font-medium tracking-tight text-warm-900 sm:text-5xl">
              A modern study flow,
              <br />
              not a cluttered dashboard
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-warm-500">
              Everything important lives in one place, with just enough structure to keep
              studying moving and none of the usual interface noise.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-20 grid max-w-6xl gap-6 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-6">
          {features.map((feature, index) => {
            const styles = accentStyles[feature.accent];
            return (
              <Reveal
                key={feature.title}
                className={cn('h-full', feature.className)}
                delay={index * 90}
              >
                <article
                  className={cn(
                    'group relative flex h-full overflow-hidden rounded-[2rem] border p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1',
                    styles.shell
                  )}
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.24em] text-warm-400">
                          {feature.eyebrow}
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-warm-900">
                          {feature.title}
                        </h3>
                      </div>
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                          styles.icon
                        )}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <p className="mt-4 max-w-xl text-base leading-relaxed text-warm-600">
                      {feature.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {feature.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium',
                            styles.pill
                          )}
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex-1">
                      <FeatureVisual visual={feature.visual} />
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
