'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="relative flex items-end gap-2 rounded-xl border border-warm-200 bg-warm-50 p-2 transition-colors focus-within:border-terracotta/50 focus-within:bg-white">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className="max-h-[200px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ minHeight: '44px' }}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
          input.trim()
            ? 'bg-terracotta text-white hover:bg-terracotta-dark'
            : 'bg-warm-200 text-warm-400'
        )}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </button>
    </div>
  );
}
