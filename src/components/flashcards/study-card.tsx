'use client';

import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';
import { Flashcard } from './flashcard-item';

interface StudyCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

const faceClass =
  'absolute inset-0 flex flex-col items-center justify-center rounded-2xl border px-8 py-16 text-center [backface-visibility:hidden] sm:px-12';

export function StudyCard({ flashcard, isFlipped, onFlip }: StudyCardProps) {
  return (
    <div className="h-[380px] w-full [perspective:1400px] sm:h-[400px]">
      <motion.button
        type="button"
        onClick={onFlip}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? 'Show question' : 'Show answer'}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={spring}
        className="group relative h-full w-full cursor-pointer rounded-2xl [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            faceClass,
            'border-warm-200 bg-card shadow-panel transition-colors group-hover:border-primary/30'
          )}
          aria-hidden={isFlipped}
        >
          <span className="absolute left-6 top-6 rounded-full bg-terracotta-light px-3 py-1 text-sm font-semibold text-terracotta-dark">
            Question
          </span>
          <span className="max-w-xl text-balance text-2xl font-medium leading-relaxed text-warm-800">
            {flashcard.front}
          </span>
          <RotateCw
            className="absolute bottom-6 right-6 h-5 w-5 text-warm-300 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        </span>

        <span
          className={cn(
            faceClass,
            'border-sage/30 bg-sage-light shadow-panel [transform:rotateY(180deg)]'
          )}
          aria-hidden={!isFlipped}
        >
          <span className="absolute left-6 top-6 rounded-full bg-white px-3 py-1 text-sm font-semibold text-sage-dark ring-1 ring-sage/25">
            Answer
          </span>
          <span className="max-w-xl text-balance text-2xl font-medium leading-relaxed text-warm-800">
            {flashcard.back}
          </span>
        </span>
      </motion.button>
    </div>
  );
}
