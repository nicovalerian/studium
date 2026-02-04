'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Shuffle } from 'lucide-react';
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
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="h-12 w-12 rounded-full border-2 border-[hsl(var(--warm-300))]"
        title="Previous Card (Left Arrow)"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        onClick={onFlip}
        className="h-12 min-w-[140px] rounded-full border-2 border-[hsl(var(--terracotta-light))] text-primary hover:bg-[hsl(var(--terracotta-light))] hover:text-[hsl(var(--terracotta-dark))]"
        title="Flip Card (Space)"
      >
        <RotateCw className="mr-2 h-4 w-4" />
        {isFlipped ? 'Show Question' : 'Show Answer'}
      </Button>

      <Button
        onClick={onNext}
        className={cn(
          'h-12 min-w-[120px] rounded-full px-6 font-semibold shadow-md transition-all duration-200 hover:scale-105',
          isLast
            ? 'bg-[hsl(var(--sage))] hover:bg-[hsl(var(--sage-dark))]'
            : 'bg-primary hover:bg-[hsl(var(--terracotta-dark))]'
        )}
        title={isLast ? 'Finish Review' : 'Next Card (Right Arrow)'}
      >
        {isLast ? 'Finish' : 'Next'}
        {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>

      <div className="ml-4 border-l border-[hsl(var(--warm-200))] pl-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onShuffle}
          className={cn(
            'h-10 w-10 rounded-full transition-colors',
            isShuffled
              ? 'bg-[hsl(var(--sage-light))] text-[hsl(var(--sage-dark))]'
              : 'text-[hsl(var(--warm-400))] hover:bg-[hsl(var(--warm-100))] hover:text-[hsl(var(--warm-700))]'
          )}
          title="Shuffle Cards"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
