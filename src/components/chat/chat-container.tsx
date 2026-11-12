'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { TypingLoader } from '@/components/ui/typing-loader';
import { easeOut } from '@/lib/motion';
import { AssistantAvatar, Message, MessageProps } from './message';

interface ChatContainerProps {
  messages: MessageProps[];
  isLoading: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, reduceMotion]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center p-6 text-center sm:p-8">
        <MessageCircle
          className="mb-4 h-8 w-8 text-primary"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h2 className="mb-2 font-display text-xl font-semibold text-warm-800">
          Your sources are the starting point
        </h2>
        <p className="max-w-md text-pretty leading-relaxed text-warm-500">
          Upload a course document, then ask for explanations, comparisons, examples, or a quick
          knowledge check.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with the study assistant"
        className="mx-auto flex w-full max-w-3xl flex-col gap-2"
      >
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={easeOut}
              className="flex w-full gap-3 py-3"
            >
              <AssistantAvatar />
              <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-warm-200 bg-white px-4 py-3 shadow-raised">
                <TypingLoader label="The study assistant is writing a reply" />
                <span className="text-sm text-warm-500">Searching your notes</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
