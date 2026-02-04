'use client';

import { cn } from '@/lib/utils';
import { MessageContent } from './message-content';
import { CopyButton } from './copy-button';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLast?: boolean;
}

export function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full gap-3 py-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-200">
          <span className="font-serif text-xs font-medium text-warm-600">S</span>
        </div>
      )}

      <div
        className={cn(
          'group relative flex max-w-[80%] flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3',
            isUser
              ? 'rounded-br-md bg-terracotta text-white'
              : 'rounded-bl-md bg-white text-warm-700 shadow-sm'
          )}
        >
          <MessageContent content={content} />

          {!isUser && (
            <div className="absolute -bottom-8 left-0 opacity-0 transition-opacity group-hover:opacity-100">
              <CopyButton content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
