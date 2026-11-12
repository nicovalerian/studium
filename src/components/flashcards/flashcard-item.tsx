'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, X, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardItemProps {
  flashcard: Flashcard;
  onUpdate: (id: string, updates: Partial<Flashcard>) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export function FlashcardItem({
  flashcard,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(flashcard.front);
  const [editBack, setEditBack] = useState(flashcard.back);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: editFront, back: editBack }),
      });

      if (!response.ok) throw new Error('Failed to update flashcard');

      onUpdate(flashcard.id, { front: editFront, back: editBack });
      setIsEditing(false);
      toast({ title: 'Flashcard updated' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete flashcard');

      onDelete(flashcard.id);
      toast({ title: 'Flashcard deleted' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete flashcard',
        variant: 'destructive',
      });
    }
  };

  if (isEditing) {
    return (
      <Card className="border-primary/40">
        <CardContent className="space-y-3 p-4">
          <div>
            <label
              htmlFor={`flashcard-${flashcard.id}-front`}
              className="text-sm font-semibold text-warm-700"
            >
              Question
            </label>
            <textarea
              id={`flashcard-${flashcard.id}-front`}
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              className="mt-1.5 flex min-h-[64px] w-full resize-none rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-800 shadow-sm placeholder:text-warm-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
            />
          </div>
          <div>
            <label
              htmlFor={`flashcard-${flashcard.id}-back`}
              className="text-sm font-semibold text-warm-700"
            >
              Answer
            </label>
            <textarea
              id={`flashcard-${flashcard.id}-back`}
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
              className="mt-1.5 flex min-h-[64px] w-full resize-none rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm text-warm-800 shadow-sm placeholder:text-warm-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X aria-hidden="true" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Check aria-hidden="true" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const faceClass =
    'absolute inset-0 flex flex-col items-center justify-center rounded-xl border p-6 text-center [backface-visibility:hidden]';

  return (
    <div className="group relative h-48 w-full [perspective:1000px]">
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        aria-pressed={isFlipped}
        aria-label={`${isFlipped ? 'Answer' : 'Question'}: ${
          isFlipped ? flashcard.back : flashcard.front
        }. Flip card`}
        className="relative h-full w-full rounded-xl text-left transition-transform duration-500 [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[flipped=true]:[transform:rotateY(180deg)]"
        data-flipped={isFlipped}
      >
        <span
          className={cn(
            faceClass,
            'border-warm-200 bg-card shadow-raised group-hover:border-primary/30'
          )}
          aria-hidden="true"
        >
          <span className="absolute left-3 top-3 rounded-full bg-terracotta-light px-2 py-0.5 text-xs font-semibold text-terracotta-dark">
            Question
          </span>
          <span className="line-clamp-4 text-base font-medium leading-snug text-warm-800">
            {flashcard.front}
          </span>
          <RotateCw
            className="absolute bottom-3 right-3 h-4 w-4 text-warm-400 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        </span>

        <span
          className={cn(
            faceClass,
            'border-sage/30 bg-sage-light/60 shadow-raised [transform:rotateY(180deg)]'
          )}
          aria-hidden="true"
        >
          <span className="absolute left-3 top-3 rounded-full bg-sage-light px-2 py-0.5 text-xs font-semibold text-sage-dark ring-1 ring-sage/20">
            Answer
          </span>
          <span className="line-clamp-4 text-base font-medium leading-snug text-warm-800">
            {flashcard.back}
          </span>
        </span>
      </button>

      {!isReadOnly ? (
        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg"
            onClick={() => setIsEditing(true)}
            aria-label="Edit flashcard"
          >
            <Pencil className="!size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            aria-label="Delete flashcard"
          >
            <Trash2 className="!size-3.5" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
