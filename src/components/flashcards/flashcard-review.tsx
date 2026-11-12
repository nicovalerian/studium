'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { easeOut } from '@/lib/motion';
import { Flashcard } from './flashcard-item';
import { StudyCard } from './study-card';
import { ProgressBar } from './progress-bar';
import { ReviewControls } from './review-controls';
import { CompletionScreen } from './completion';

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  classId: string;
}

/** Keys typed into these elements, or activating them, keep their native behaviour. */
function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || !!target.closest('input, textarea, select, button, a'))
  );
}

const cardVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

export function FlashcardReview({ flashcards, classId }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>(flashcards);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setReviewCards(flashcards);
  }, [flashcards]);

  const handleNext = useCallback(() => {
    if (currentIndex < reviewCards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, reviewCards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = useCallback(() => {
    setIsFlipped(false);
    setIsComplete(false);
    setCurrentIndex(0);

    if (!isShuffled) {
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setReviewCards(shuffled);
      setIsShuffled(true);
    } else {
      setReviewCards(flashcards);
      setIsShuffled(false);
    }
  }, [flashcards, isShuffled]);

  const handleRestart = () => {
    setIsComplete(false);
    setCurrentIndex(0);
    setDirection(1);
    setIsFlipped(false);
    if (isShuffled) {
      setReviewCards([...flashcards].sort(() => Math.random() - 0.5));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || e.altKey || e.ctrlKey || e.metaKey) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          // A focused control (including the card itself) handles these natively.
          if (isInteractiveTarget(e.target)) return;
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          if (isInteractiveTarget(e.target) && !(e.target as HTMLElement).closest('button')) return;
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (isInteractiveTarget(e.target) && !(e.target as HTMLElement).closest('button')) return;
          e.preventDefault();
          handlePrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, isComplete]);

  if (flashcards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Layers className="mb-4 h-8 w-8 text-warm-300" aria-hidden="true" />
        <h2 className="text-2xl font-semibold text-warm-900">No flashcards yet</h2>
        <p className="mt-2 max-w-sm text-pretty text-warm-500">
          Generate some flashcards in the class dashboard to start studying.
        </p>
        <Button asChild className="mt-6" variant="outline" size="lg">
          <Link href={`/class/${classId}`}>
            <ArrowLeft aria-hidden="true" />
            Back to class
          </Link>
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <CompletionScreen
        totalReviewed={reviewCards.length}
        onRestart={handleRestart}
        classId={classId}
      />
    );
  }

  const currentCard = reviewCards[currentIndex];

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-full max-w-2xl">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-3 mb-6 h-9 text-warm-600 hover:text-warm-900"
        >
          <Link href={`/class/${classId}`}>
            <ArrowLeft aria-hidden="true" />
            Back to class
          </Link>
        </Button>

        <div className="flex flex-col items-center gap-8">
          <ProgressBar current={currentIndex + 1} total={reviewCards.length} />

          <div className="w-full overflow-hidden px-1 py-2 sm:overflow-visible">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentCard.id}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ ...easeOut, duration: 0.24 }}
              >
                <StudyCard flashcard={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
              </motion.div>
            </AnimatePresence>
          </div>

          <ReviewControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFlip={handleFlip}
            onShuffle={handleShuffle}
            isFlipped={isFlipped}
            hasPrevious={currentIndex > 0}
            isLast={currentIndex === reviewCards.length - 1}
            isShuffled={isShuffled}
          />
        </div>
      </div>
    </div>
  );
}
