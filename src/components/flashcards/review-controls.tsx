'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, RotateCw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
  onShuffle: () => void;
  isFlipped: boolean;
  hasPrevious: boolean;
  isLast: boolean;
  isShuffled: boolean;
}

export function ReviewControls({
  onPrevious,
  onNext,
  onFlip,
  onShuffle,
  isFlipped,
  hasPrevious,
  isLast,
  isShuffled,
}: ReviewControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Previous card"
          aria-keyshortcuts="ArrowLeft"
        >
          <ArrowLeft aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onFlip}
          className="min-w-[10rem]"
          aria-keyshortcuts="Space"
        >
          <RotateCw aria-hidden="true" />
          {isFlipped ? 'Show question' : 'Show answer'}
        </Button>

        <Button
          type="button"
          size="lg"
          variant={isLast ? 'success' : 'default'}
          onClick={onNext}
          className="min-w-[8.5rem]"
          aria-keyshortcuts="ArrowRight"
        >
          {isLast ? 'Finish' : 'Next'}
          {isLast ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        </Button>

        <span className="mx-1 hidden h-8 w-px bg-warm-200 sm:block" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={onShuffle}
          aria-pressed={isShuffled}
          aria-label={isShuffled ? 'Restore original order' : 'Shuffle cards'}
          className={cn(
            isShuffled ? 'bg-sage-light text-sage-dark hover:bg-sage-light' : 'text-warm-500'
          )}
        >
          <Shuffle aria-hidden="true" />
        </Button>
      </div>

      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-warm-500">
        <span className="inline-flex items-center gap-1.5">
          <kbd>Space</kbd> flip
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd aria-label="Left arrow">←</kbd>
          <kbd aria-label="Right arrow">→</kbd> previous / next
        </span>
      </p>
    </div>
  );
}
