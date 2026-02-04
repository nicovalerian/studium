'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerateButtonProps {
  classId: string;
  onGenerateComplete: (newFlashcards: { id: string; front: string; back: string }[]) => void;
  disabled?: boolean;
}

export function GenerateButton({ classId, onGenerateComplete, disabled }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
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
          title: 'Success!',
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
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="w-full bg-primary font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-[hsl(var(--terracotta-dark))] hover:shadow-md"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Flashcards
        </>
      )}
    </Button>
  );
}
