'use client';

import { useEffect, useRef } from 'react';
import { Message, MessageProps } from './message';
import { Loader2 } from 'lucide-react';

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
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
        <p className="max-w-sm text-sm">
          Start the conversation by asking a question about your documents.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((msg, index) => (
        <Message
          key={index}
          role={msg.role}
          content={msg.content}
          isLast={index === messages.length - 1}
        />
      ))}

      {isLoading && (
        <div className="flex w-full gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 shadow-sm">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
