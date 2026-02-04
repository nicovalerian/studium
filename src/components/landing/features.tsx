import { Upload, MessageCircle, Layers, BookOpen } from 'lucide-react';

const features = [
  {
    title: 'Drop your files',
    description:
      'PDF or Word documents—just drag and drop. Your materials are processed instantly and kept private.',
    icon: Upload,
    accent: 'terracotta',
  },
  {
    title: 'Have a conversation',
    description:
      'Ask questions about your notes like you would a study partner. Get answers grounded in your actual materials.',
    icon: MessageCircle,
    accent: 'sage',
  },
  {
    title: 'Generate flashcards',
    description:
      'Turn dense notes into bite-sized cards automatically. Edit them, organize them, make them yours.',
    icon: Layers,
    accent: 'sand',
  },
  {
    title: 'Study with intent',
    description:
      'Review your cards with a clean, distraction-free interface. Focus on what matters—actually learning.',
    icon: BookOpen,
    accent: 'terracotta',
  },
];

const accentStyles = {
  terracotta: {
    bg: 'bg-terracotta-light',
    icon: 'text-terracotta',
    border: 'border-terracotta/20',
  },
  sage: {
    bg: 'bg-sage-light',
    icon: 'text-sage',
    border: 'border-sage/20',
  },
  sand: {
    bg: 'bg-sand-light',
    icon: 'text-sand',
    border: 'border-sand/20',
  },
};

export function Features() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-medium tracking-tight text-warm-800 sm:text-5xl">
            Simple by design
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-warm-500">
            No complicated setup. No learning curve. Just upload, chat, and study.
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => {
              const styles = accentStyles[feature.accent as keyof typeof accentStyles];
              return (
                <div
                  key={feature.title}
                  className="card-warm-hover group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.bg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <feature.icon className={`h-6 w-6 ${styles.icon}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-warm-800">{feature.title}</h3>
                      <p className="mt-2 leading-relaxed text-warm-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
