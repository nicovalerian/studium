'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { easeOut } from '@/lib/motion';
import { MessageContent } from './message-content';
import { CopyButton } from './copy-button';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-900 font-display text-xs font-semibold text-white"
      aria-hidden="true"
    >
      S
    </div>
  );
}

export function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOut}
      className={cn('flex w-full gap-3 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && <AssistantAvatar />}

      <div
        className={cn(
          'group relative flex max-w-[85%] flex-col gap-1 sm:max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <span className="sr-only">{isUser ? 'You said:' : 'Study assistant said:'}</span>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-[15px]',
            isUser
              ? 'rounded-br-md bg-primary text-white'
              : 'rounded-bl-md border border-warm-200 bg-white text-warm-700 shadow-raised'
          )}
        >
          <MessageContent content={content} variant={isUser ? 'inverse' : 'default'} />
        </div>

        {!isUser && (
          <div className="opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <CopyButton content={content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
