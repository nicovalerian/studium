import { Upload, MessageSquare, Zap, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    name: 'Upload Documents',
    description:
      'Support for PDF and DOCX files. Simply upload your course materials and let our AI process them instantly.',
    icon: Upload,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    name: 'AI Chat',
    description:
      'Ask questions about your materials and get smart, context-aware answers based specifically on your notes.',
    icon: MessageSquare,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    name: 'Smart Flashcards',
    description:
      'Automatically generate study cards from your content. Save hours of manual typing and focus on learning.',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    name: 'Study Mode',
    description:
      'Review your flashcards with interactive flip animations and track your progress as you master each topic.',
    icon: BookOpen,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-slate-50 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to excel
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Studium combines powerful AI with proven study techniques to help you learn faster and
            retain more.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.name}
                className="border-none shadow-md transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <CardTitle className="mt-4 text-xl font-semibold leading-7 text-slate-900">
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-7 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
