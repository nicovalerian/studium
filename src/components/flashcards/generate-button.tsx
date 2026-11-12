'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WorkspaceAccessState } from '@/lib/auth/access';

interface GenerateButtonProps {
  classId: string | null;
  onGenerateComplete: (newFlashcards: { id: string; front: string; back: string }[]) => void;
  disabled?: boolean;
  workspaceState?: WorkspaceAccessState;
  onBlockedAction?: () => void;
}

export function GenerateButton({
  classId,
  onGenerateComplete,
  disabled,
  workspaceState = 'verified',
  onBlockedAction,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const isBlocked = workspaceState !== 'verified';

  const handleGenerate = async () => {
    if (isBlocked || !classId) {
      onBlockedAction?.();
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();

      if (data.flashcards && data.flashcards.length > 0) {
        onGenerateComplete(data.flashcards);
        toast({
          title: 'Flashcards ready',
          description: `Generated ${data.flashcards.length} new flashcards.`,
        });
      } else {
        toast({
          title: 'No flashcards generated',
          description: 'Try adding more documents first.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate flashcards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={(!isBlocked && disabled) || isGenerating}
        aria-busy={isGenerating}
        className="h-auto min-h-11 w-full whitespace-normal px-4 py-3 text-center font-semibold leading-snug"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Generating flashcards…
          </>
        ) : isBlocked ? (
          <>
            <Lock aria-hidden="true" />
            {workspaceState === 'guest'
              ? 'Sign in to generate flashcards'
              : 'Verify email to generate'}
          </>
        ) : (
          <>
            <Layers aria-hidden="true" />
            Generate flashcards
          </>
        )}
      </Button>
      {isBlocked ? (
        <p className="text-center text-xs text-warm-500">
          {workspaceState === 'guest'
            ? 'Create an account first, then flashcards unlock right away.'
            : 'Email verification unlocks flashcard generation.'}
        </p>
      ) : null}
      {disabled && !isGenerating && !isBlocked ? (
        <p className="text-center text-xs text-warm-500">
          Upload and process documents first to generate flashcards.
        </p>
      ) : null}
    </div>
  );
}
