'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flashcard } from './flashcard-item';
import { StudyCard } from './study-card';
import { ProgressBar } from './progress-bar';
import { ReviewControls } from './review-controls';
import { CompletionScreen } from './completion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  classId: string;
}

export function FlashcardReview({ flashcards, classId }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>(flashcards);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setReviewCards(flashcards);
  }, [flashcards]);

  const handleNext = useCallback(() => {
    if (currentIndex < reviewCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, reviewCards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
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
    setIsFlipped(false);
    if (isShuffled) {
      setReviewCards([...flashcards].sort(() => Math.random() - 0.5));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-[hsl(var(--warm-800))]">No flashcards yet</h2>
        <p className="mt-2 text-[hsl(var(--warm-500))]">
          Generate some flashcards in the class dashboard to start studying.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/class/${classId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Class
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
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-[hsl(var(--warm-500))] hover:bg-[hsl(var(--warm-100))] hover:text-[hsl(var(--warm-700))]"
          >
            <Link href={`/class/${classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class
            </Link>
          </Button>
          <div className="text-sm font-medium text-[hsl(var(--warm-500))]">Study Mode</div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <ProgressBar current={currentIndex + 1} total={reviewCards.length} />

          <StudyCard flashcard={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />

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
