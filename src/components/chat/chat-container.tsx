'use client';

import { useEffect, useRef } from 'react';
import { Message, MessageProps } from './message';
import { MessageCircle } from 'lucide-react';

interface ChatContainerProps {
  messages: MessageProps[];
  isLoading: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-terracotta-light">
          <MessageCircle className="h-8 w-8 text-terracotta" />
        </div>
        <h3 className="mb-2 font-serif text-xl font-medium text-warm-800">Start a conversation</h3>
        <p className="max-w-sm text-warm-500">
          Ask questions about your documents and get thoughtful answers based on your notes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
      {messages.map((msg, index) => (
        <Message
          key={index}
          role={msg.role}
          content={msg.content}
          isLast={index === messages.length - 1}
        />
      ))}

      {isLoading && (
        <div className="flex w-full gap-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-200">
            <span className="font-serif text-xs font-medium text-warm-600">S</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
            <span className="h-2 w-2 animate-bounce rounded-full bg-warm-300 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-warm-300 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-warm-300" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
