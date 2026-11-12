'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { easeOut, spring } from '@/lib/motion';

interface CompletionScreenProps {
  totalReviewed: number;
  onRestart: () => void;
  classId: string;
}

export function CompletionScreen({ totalReviewed, onRestart, classId }: CompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      className="flex min-h-[500px] w-full flex-col items-center justify-center p-8 text-center"
      role="status"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.08 }}
        className="mb-6"
      >
        <CheckCircle2 className="h-14 w-14 text-sage-dark" strokeWidth={1.75} aria-hidden="true" />
      </motion.div>

      <h2 className="mb-2 text-3xl font-semibold text-warm-900">Review complete</h2>
      <p className="mb-8 text-lg text-warm-500">
        You reviewed all{' '}
        <span className="font-semibold tabular-nums text-warm-800">{totalReviewed}</span>{' '}
        flashcards.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={onRestart} size="lg" className="min-w-[10rem]" autoFocus>
          <RotateCcw aria-hidden="true" />
          Review again
        </Button>

        <Button asChild variant="outline" size="lg" className="min-w-[10rem]">
          <Link href={`/class/${classId}`}>
            <ArrowLeft aria-hidden="true" />
            Back to class
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
