import { Upload, MessageSquare, Zap, BookOpen } from 'lucide-react';

const features = [
  {
    name: 'Upload Documents',
    description:
      'Support for PDF and DOCX files. Simply upload your course materials and let our AI process them instantly.',
    icon: Upload,
    color: 'bg-[hsl(199,89%,48%)]',
    lightColor: 'bg-[hsl(199,89%,95%)]',
  },
  {
    name: 'AI Chat',
    description:
      'Ask questions about your materials and get smart, context-aware answers based specifically on your notes.',
    icon: MessageSquare,
    color: 'bg-[hsl(142,76%,36%)]',
    lightColor: 'bg-[hsl(142,76%,95%)]',
  },
  {
    name: 'Smart Flashcards',
    description:
      'Automatically generate study cards from your content. Save hours of manual typing and focus on learning.',
    icon: Zap,
    color: 'bg-[hsl(25,95%,53%)]',
    lightColor: 'bg-[hsl(25,95%,95%)]',
  },
  {
    name: 'Study Mode',
    description:
      'Review your flashcards with interactive flip animations and track your progress as you master each topic.',
    icon: BookOpen,
    color: 'bg-[hsl(250,60%,60%)]',
    lightColor: 'bg-[hsl(250,60%,95%)]',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-[hsl(220,20%,20%)] sm:text-5xl">
            Everything you need to excel
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-[hsl(220,10%,45%)]">
            Studium combines powerful AI with proven study techniques to help you learn faster and
            retain more.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="feature-card flex gap-6">
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${feature.color} text-white shadow-lg`}
                >
                  <feature.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-[hsl(220,20%,20%)]">{feature.name}</h3>
                  <p className="text-base leading-relaxed text-[hsl(220,10%,45%)]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
