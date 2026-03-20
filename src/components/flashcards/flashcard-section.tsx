'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateButton } from './generate-button';
import { FlashcardItem, Flashcard } from './flashcard-item';
import { Layers, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { WorkspaceAccessState } from '@/lib/auth/access';

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
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-[hsl(var(--sage))]" />
          Flashcards
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-[hsl(var(--warm-200))] px-2 py-1 text-xs font-normal text-[hsl(var(--warm-600))]">
              {flashcards.length}
            </span>
            {flashcards.length > 0 && (
              <Button
                asChild
                size="sm"
                className="h-7 rounded-full bg-[hsl(var(--sage))] hover:bg-[hsl(var(--sage-dark))]"
              >
                <Link href={classId ? `/class/${classId}/flashcards` : '/dashboard'}>
                  <Play className="mr-1 h-3 w-3" /> Study
                </Link>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <GenerateButton
          classId={classId}
          onGenerateComplete={handleGenerateComplete}
          disabled={!hasDocuments}
          workspaceState={workspaceState}
          onBlockedAction={onBlockedAction}
        />

        {isReadOnly && flashcards.length > 0 ? (
          <p className="text-center text-xs text-[hsl(var(--warm-500))]">
            Flashcards stay read-only until {workspaceState === 'guest' ? 'you sign in' : 'your email is verified'}.
          </p>
        ) : null}

        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
          {flashcards.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[hsl(var(--warm-200))] bg-[hsl(var(--warm-100))] p-4 text-center text-[hsl(var(--warm-500))]">
              <Layers className="mb-2 h-8 w-8 text-[hsl(var(--warm-300))]" />
              <p className="text-sm font-medium text-[hsl(var(--warm-600))]">No flashcards yet</p>
              <p className="mt-1 max-w-[180px] text-xs">
                {hasDocuments
                  ? 'Click generate to create flashcards from your documents.'
                  : 'Upload documents first to generate flashcards.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {flashcards.map((flashcard) => (
                <FlashcardItem
                  key={flashcard.id}
                  flashcard={flashcard}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
