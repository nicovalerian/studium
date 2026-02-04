'use client';

import { cn } from '@/lib/utils';
import { Flashcard } from './flashcard-item';
import { RotateCw } from 'lucide-react';

interface StudyCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

export function StudyCard({ flashcard, isFlipped, onFlip }: StudyCardProps) {
  return (
    <div
      className="group relative h-[400px] w-full max-w-2xl cursor-pointer [perspective:1000px]"
      onClick={onFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-2xl border-2 shadow-xl transition-all duration-500 [transform-style:preserve-3d]',
          isFlipped
            ? 'border-[hsl(var(--sage-light))] [transform:rotateY(180deg)]'
            : 'border-[hsl(var(--warm-200))] hover:border-primary/30'
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[hsl(var(--card))] p-8 text-center [backface-visibility:hidden]">
          <div className="absolute left-6 top-6">
            <span className="rounded-full bg-[hsl(var(--terracotta-light))] px-3 py-1 text-sm font-bold uppercase tracking-wider text-[hsl(var(--terracotta-dark))]">
              Question
            </span>
          </div>
          <p className="text-2xl font-medium leading-relaxed text-[hsl(var(--warm-800))]">
            {flashcard.front}
          </p>
          <div className="absolute bottom-6 right-6 text-primary opacity-0 transition-opacity group-hover:opacity-100">
            <RotateCw className="h-6 w-6" />
          </div>
          <div className="absolute bottom-6 left-6 text-xs font-medium text-[hsl(var(--warm-400))]">
            Click or Space to flip
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--warm-100))] to-[hsl(var(--sage-light))] p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="absolute left-6 top-6">
            <span className="rounded-full bg-[hsl(var(--sage-light))] px-3 py-1 text-sm font-bold uppercase tracking-wider text-[hsl(var(--sage-dark))]">
              Answer
            </span>
          </div>
          <p className="text-2xl font-medium leading-relaxed text-[hsl(var(--warm-800))]">
            {flashcard.back}
          </p>
        </div>
      </div>
    </div>
  );
}
