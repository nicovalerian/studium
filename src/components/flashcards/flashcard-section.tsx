'use client';

import Link from 'next/link';
import { Layers, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { easeOut } from '@/lib/motion';
import type { WorkspaceAccessState } from '@/lib/auth/access';
import { GenerateButton } from './generate-button';
import { FlashcardItem, Flashcard } from './flashcard-item';

interface FlashcardSectionProps {
  classId: string | null;
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
  hasDocuments: boolean;
  workspaceState?: WorkspaceAccessState;
  onBlockedAction?: () => void;
}

export function FlashcardSection({
  classId,
  flashcards,
  onFlashcardsChange,
  hasDocuments,
  workspaceState = 'verified',
  onBlockedAction,
}: FlashcardSectionProps) {
  const isReadOnly = workspaceState !== 'verified';

  const handleGenerateComplete = (newFlashcards: Flashcard[]) => {
    onFlashcardsChange([...flashcards, ...newFlashcards]);
  };

  const handleUpdate = (id: string, updates: Partial<Flashcard>) => {
    onFlashcardsChange(flashcards.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDelete = (id: string) => {
    onFlashcardsChange(flashcards.filter((f) => f.id !== id));
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <p className="text-sm text-warm-600">
          <span className="font-semibold tabular-nums text-warm-900">{flashcards.length}</span>{' '}
          {flashcards.length === 1 ? 'card' : 'cards'}
        </p>
        {flashcards.length > 0 && (
          <Button asChild size="sm" variant="success" className="h-9 px-3.5">
            <Link href={classId ? `/class/${classId}/flashcards` : '/dashboard'}>
              <Play aria-hidden="true" /> Study
            </Link>
          </Button>
        )}
      </div>

      <GenerateButton
        classId={classId}
        onGenerateComplete={handleGenerateComplete}
        disabled={!hasDocuments}
        workspaceState={workspaceState}
        onBlockedAction={onBlockedAction}
      />

      {isReadOnly && flashcards.length > 0 ? (
        <p className="text-center text-xs text-warm-500">
          Flashcards stay read-only until{' '}
          {workspaceState === 'guest' ? 'you sign in' : 'your email is verified'}.
        </p>
      ) : null}

      <div className="flex-1">
        {flashcards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-warm-50 px-4 py-8 text-center">
            <Layers className="mb-3 h-7 w-7 text-warm-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-warm-700">No flashcards yet</p>
            <p className="mt-1 max-w-[15rem] text-sm text-warm-500">
              {hasDocuments
                ? 'Click generate to create flashcards from your documents.'
                : 'Upload documents first to generate flashcards.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pb-2">
            <AnimatePresence initial={false}>
              {flashcards.map((flashcard) => (
                <motion.li
                  key={flashcard.id}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={easeOut}
                >
                  <FlashcardItem
                    flashcard={flashcard}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isReadOnly={isReadOnly}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
