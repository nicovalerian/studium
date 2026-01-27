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
}

export function FlashcardItem({ flashcard, onUpdate, onDelete }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(flashcard.front);
  const [editBack, setEditBack] = useState(flashcard.back);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFlip = (e: React.MouseEvent) => {
    if (isEditing) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsFlipped(!isFlipped);
  };

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
      <Card className="mb-4 border-2 border-indigo-100 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Front</label>
            <textarea
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              className="mt-1 flex min-h-[60px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Back</label>
            <textarea
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
              className="mt-1 flex min-h-[60px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Check className="mr-1 h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="group relative mb-4 h-48 w-full cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-xl border-2 shadow-md transition-all duration-500 [transform-style:preserve-3d]',
          isFlipped
            ? 'border-purple-200 [transform:rotateY(180deg)]'
            : 'border-indigo-100 hover:border-indigo-300'
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white p-6 text-center [backface-visibility:hidden]">
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              Question
            </span>
          </div>
          <p className="line-clamp-4 text-lg font-medium text-slate-800">{flashcard.front}</p>
          <div className="absolute bottom-3 right-3 text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
            <RotateCw className="h-4 w-4" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
              Answer
            </span>
          </div>
          <p className="line-clamp-4 text-lg font-medium text-slate-800">{flashcard.back}</p>
        </div>

        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-white"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-white/80 shadow-sm hover:bg-red-50 hover:text-red-600"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
