'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateButton } from './generate-button';
import { FlashcardItem, Flashcard } from './flashcard-item';
import { Layers, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FlashcardSectionProps {
  classId: string;
  flashcards: Flashcard[];
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
  hasDocuments: boolean;
}

export function FlashcardSection({
  classId,
  flashcards,
  onFlashcardsChange,
  hasDocuments,
}: FlashcardSectionProps) {
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
          <Layers className="h-5 w-5 text-indigo-500" />
          Flashcards
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-normal text-muted-foreground">
              {flashcards.length}
            </span>
            {flashcards.length > 0 && (
              <Button
                asChild
                size="sm"
                className="h-7 rounded-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Link href={`/class/${classId}/flashcards`}>
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
        />

        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
          {flashcards.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-4 text-center text-muted-foreground">
              <Layers className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm font-medium">No flashcards yet</p>
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
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
