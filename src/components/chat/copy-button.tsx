'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  content: string;
  className?: string;
}

export function CopyButton({ content, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn('h-7 gap-1.5 px-2 text-xs text-warm-500 hover:text-warm-800', className)}
      onClick={copyToClipboard}
      aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
    >
      {isCopied ? (
        <Check className="text-sage-dark" aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      <span aria-live="polite">{isCopied ? 'Copied' : 'Copy'}</span>
    </Button>
  );
}
