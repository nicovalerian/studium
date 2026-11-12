import { BookOpen, Check, FileText, Layers, MessageCircle, Upload } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Drop your files',
    description:
      'PDFs, lecture slides, and Word docs land in one tidy workspace so you can start studying without any setup friction.',
    icon: Upload,
    className: 'lg:col-span-3',
    highlights: ['PDF + DOCX support', 'Private processing'],
    visual: 'upload',
  },
  {
    title: 'Grounded AI chat',
    description:
      'Get grounded answers that stay close to your actual notes instead of drifting into generic summaries.',
    icon: MessageCircle,
    className: 'lg:col-span-3',
    highlights: ['Context-aware replies', 'Better follow-up questions'],
    visual: 'chat',
  },
  {
    title: 'Generate flashcards that feel usable',
    description:
      'Turn dense content into clean prompts and answers you can review right away or refine later.',
    icon: Layers,
    className: 'lg:col-span-2',
    highlights: ['One-click flashcards', 'Structured review'],
    visual: 'cards',
  },
  {
    title: 'Stay in a focused study loop',
    description:
      'Move from upload to chat to review inside one calm interface that keeps the next best step obvious.',
    icon: BookOpen,
    className: 'lg:col-span-4',
    highlights: ['Fewer context switches', 'Made for real coursework'],
    visual: 'review',
  },
] as const;

const studySteps = [
  { title: 'Upload source material', detail: 'PDF or DOCX, by class.' },
  { title: 'Ask grounded questions', detail: 'Answers from your notes.' },
  { title: 'Review cards with intent', detail: 'Flip, shuffle, repeat.' },
];

function FeatureVisual({ visual }: { visual: (typeof features)[number]['visual'] }) {
  switch (visual) {
    case 'upload':
      return (
        <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 bg-warm-50 px-4 py-8 text-center">
            <Upload className="h-5 w-5 text-warm-400" aria-hidden="true" />
            <div className="mt-3 max-w-[14rem] text-sm leading-relaxed text-warm-500">
              Drop a lecture deck, an article, or a seminar handout and let Studium sort the rest.
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: 'behavioral-econ.pdf', width: 'w-3/4' },
              { name: 'week-7-notes.docx', width: 'w-1/2' },
            ].map((file) => (
              <div key={file.name} className="rounded-xl bg-warm-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-warm-800">
                  <FileText className="h-4 w-4 text-warm-400" aria-hidden="true" />
                  {file.name}
                </div>
                <div className={cn('mt-2 h-1.5 rounded-full bg-warm-200', file.width)} />
              </div>
            ))}
            <div className="rounded-xl bg-warm-900 px-4 py-4 text-sm leading-relaxed text-white/85">
              Everything stays organized by class and ready for the next study session.
            </div>
          </div>
        </div>
      );

    case 'chat':
      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="max-w-[18rem] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-white">
              Compare intrinsic and extrinsic motivation from my notes.
            </div>
          </div>
          <div className="flex">
            <div className="max-w-[20rem] rounded-2xl rounded-bl-md bg-warm-50 px-4 py-3 text-sm leading-relaxed text-warm-700">
              Your notes frame intrinsic motivation as internally rewarding, while extrinsic
              motivation depends on outside incentives like grades or deadlines.
            </div>
          </div>
          <p className="px-1 text-sm text-warm-500">
            Follow-up suggestions: ask for examples, counterpoints, or flashcard prompts.
          </p>
        </div>
      );

    case 'cards':
      return (
        <div className="relative flex min-h-[13rem] items-center justify-center overflow-hidden rounded-xl bg-warm-50 p-4">
          <div className="absolute h-36 w-56 rotate-[-8deg] rounded-xl bg-warm-200/70" />
          <div className="absolute h-36 w-56 rotate-[6deg] rounded-xl bg-sand-light" />
          <div className="relative z-10 w-full max-w-[15rem] rounded-xl border border-warm-200 bg-white px-5 py-4 shadow-raised">
            <span className="inline-flex rounded-full bg-terracotta-light px-2 py-0.5 text-xs font-semibold text-terracotta-dark">
              Question
            </span>
            <div className="mt-3 text-base font-semibold leading-snug text-warm-800">
              What makes spaced repetition effective for exam prep?
            </div>
          </div>
        </div>
      );

    case 'review':
      return (
        <ol className="grid h-full gap-2 sm:grid-cols-3">
          {studySteps.map((step, index) => {
            const isCurrent = index === studySteps.length - 1;
            return (
              <li
                key={step.title}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium sm:flex-col sm:items-start sm:justify-between sm:gap-6 sm:py-4',
                  isCurrent
                    ? 'bg-terracotta-light text-terracotta-dark'
                    : 'bg-warm-50 text-warm-700'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-white text-warm-600 ring-1 ring-warm-200'
                  )}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block">{step.title}</span>
                  <span
                    className={cn(
                      'mt-1 hidden text-sm font-normal leading-snug sm:block',
                      isCurrent ? 'text-terracotta-dark' : 'text-warm-500'
                    )}
                  >
                    {step.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      );
  }
}

export function Features() {
  return (
    <section id="how-it-works" className="scroll-mt-8 bg-white py-24 sm:py-32">
      <div className="container mx-auto px-5 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2
            id="simple-by-design"
            className="scroll-mt-28 font-display text-4xl font-semibold tracking-tight text-warm-900 sm:text-5xl"
          >
            From source material
            <br />
            to active recall
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-warm-500">
            Everything important lives in one place, with just enough structure to keep studying
            moving and none of the usual interface noise.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:mt-20 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-6 lg:gap-5">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              className={cn('h-full', feature.className)}
              delay={index * 80}
            >
              <article className="flex h-full flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-raised sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight text-warm-900">
                    {feature.title}
                  </h3>
                  <feature.icon
                    className="mt-1 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-warm-600">
                  {feature.description}
                </p>

                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                  {feature.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-1.5 text-sm font-medium text-warm-700"
                    >
                      <Check className="h-4 w-4 text-sage-dark" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-1 flex-col [&>*]:flex-1">
                  <FeatureVisual visual={feature.visual} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
