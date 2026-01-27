'use client';

import { cn } from '@/lib/utils';
import { MessageContent } from './message-content';
import { CopyButton } from './copy-button';
import { Bot, User } from 'lucide-react';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLast?: boolean;
}

export function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full gap-3 p-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'group relative flex max-w-[85%] flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm border bg-card text-card-foreground'
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
