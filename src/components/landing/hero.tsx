import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-32 lg:pb-32 xl:pb-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Study Smarter with{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Upload your notes, chat with AI about your materials, and generate flashcards
            automatically. Your personal AI-powered study companion.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-slate-900">
              <Link href="#features">Learn more</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
