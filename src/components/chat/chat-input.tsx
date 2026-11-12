'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowUp, Lock } from 'lucide-react';
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
  placeholder = 'Type a message…',
  workspaceState = 'verified',
  onBlockedAction,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBlocked = workspaceState !== 'verified';
  const canSend = input.trim().length > 0 && !isLoading;

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

  const handleSend = () => {
    if (canSend) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isBlocked) {
    return (
      <button
        type="button"
        onClick={onBlockedAction}
        className="group mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-warm-200 bg-warm-50 px-4 py-3 text-left transition-colors hover:border-warm-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Lock className="h-4 w-4 shrink-0 text-warm-500" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-warm-800">
            {workspaceState === 'guest'
              ? 'Sign in to start chatting with your notes'
              : 'Verify your email to start chatting'}
          </span>
          <span className="mt-0.5 block text-xs text-warm-500">
            {workspaceState === 'guest'
              ? 'Guest mode keeps the dashboard visible while the interactive tools stay locked.'
              : 'Once your email is confirmed, chat unlocks right away.'}
          </span>
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end gap-2 rounded-2xl border border-warm-300 bg-white p-2 shadow-raised transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Message the study assistant"
          aria-describedby="chat-input-hint"
          disabled={isLoading}
          rows={1}
          className="max-h-[200px] min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-[15px] text-warm-800 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            canSend
              ? 'bg-primary text-white hover:bg-terracotta-dark active:scale-95'
              : 'cursor-not-allowed bg-warm-100 text-warm-400'
          )}
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <p id="chat-input-hint" className="mt-2 hidden px-1 text-xs text-warm-500 sm:block">
        <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
      </p>
    </div>
  );
}
