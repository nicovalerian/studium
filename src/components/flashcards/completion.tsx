'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CompletionScreenProps {
  totalReviewed: number;
  onRestart: () => void;
  classId: string;
}

export function CompletionScreen({ totalReviewed, onRestart, classId }: CompletionScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center p-8 text-center duration-500 animate-in fade-in zoom-in">
      <div className="mb-6 rounded-full bg-green-100 p-6">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>

      <h2 className="mb-2 text-3xl font-bold text-slate-900">Review Complete!</h2>
      <p className="mb-8 text-lg text-muted-foreground">
        You&apos;ve reviewed all{' '}
        <span className="font-semibold text-foreground">{totalReviewed}</span> flashcards.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onRestart}
          size="lg"
          className="min-w-[160px] rounded-full bg-indigo-600 hover:bg-indigo-700"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Review Again
        </Button>

        <Button asChild variant="outline" size="lg" className="min-w-[160px] rounded-full">
          <Link href={`/class/${classId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Class
          </Link>
        </Button>
      </div>
    </div>
  );
}
