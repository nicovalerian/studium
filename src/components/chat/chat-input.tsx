'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceAccessState } from '@/lib/auth/access';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  workspaceState?: WorkspaceAccessState;
  onBlockedAction?: () => void;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder = 'Type a message...',
  workspaceState = 'verified',
  onBlockedAction,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBlocked = workspaceState !== 'verified';

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
    if (isBlocked) {
      e.preventDefault();
      onBlockedAction?.();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isBlocked) {
      onBlockedAction?.();
      return;
    }

    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-warm-200 bg-white p-2 shadow-[0_12px_42px_-28px_rgba(35,29,92,.45)] transition-all duration-200 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/5">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || isBlocked}
          rows={1}
          className="max-h-[200px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: '44px' }}
        />
        <button
          onClick={handleSend}
          disabled={(!input.trim() && !isBlocked) || isLoading}
          className={cn(
            'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            input.trim() || isBlocked
              ? 'bg-terracotta text-white hover:bg-terracotta-dark'
              : 'bg-warm-200 text-warm-400'
          )}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </button>
      </div>

      {isBlocked ? (
        <button
          type="button"
          onClick={onBlockedAction}
          className="absolute inset-0 z-10 flex items-center rounded-xl bg-white/70 px-4 text-left backdrop-blur-[2px]"
        >
          <div>
            <p className="text-sm font-medium text-warm-800">
              {workspaceState === 'guest'
                ? 'Sign in to start chatting with your notes'
                : 'Verify your email to start chatting'}
            </p>
            <p className="mt-1 text-xs text-warm-500">
              {workspaceState === 'guest'
                ? 'Guest mode keeps the dashboard visible while the interactive tools stay locked.'
                : 'Once your email is confirmed, chat unlocks right away.'}
            </p>
          </div>
        </button>
      ) : null}
    </div>
  );
}
