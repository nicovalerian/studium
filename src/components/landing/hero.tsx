import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[hsl(142,76%,97%)] to-white py-20 sm:py-32 lg:pb-32 xl:pb-36">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute left-10 top-20 h-20 w-20 rounded-full bg-[hsl(142,76%,36%,0.1)]" />
        <div className="animate-float-delayed absolute right-20 top-40 h-16 w-16 rounded-full bg-[hsl(25,95%,53%,0.1)]" />
        <div className="animate-float absolute bottom-40 left-1/4 h-12 w-12 rounded-full bg-[hsl(250,60%,60%,0.1)]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[hsl(142,76%,95%)] px-4 py-2 text-sm font-bold text-[hsl(142,76%,28%)]">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-[hsl(220,20%,20%)] sm:text-6xl lg:text-7xl">
            Study Smarter with{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[hsl(142,76%,36%)]">AI</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,8 Q50,0 100,8"
                  stroke="hsl(142,76%,36%)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-[hsl(220,10%,45%)]">
            Upload your notes, chat with AI about your materials, and generate flashcards
            automatically. Your personal AI-powered study companion.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="btn-primary animate-pulse-soft flex items-center gap-2 text-lg"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#features" className="btn-secondary text-lg">
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[hsl(142,76%,36%)]">10K+</div>
              <div className="mt-1 text-sm text-[hsl(220,10%,45%)]">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[hsl(25,95%,53%)]">50K+</div>
              <div className="mt-1 text-sm text-[hsl(220,10%,45%)]">Flashcards Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[hsl(250,60%,60%)]">98%</div>
              <div className="mt-1 text-sm text-[hsl(220,10%,45%)]">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
