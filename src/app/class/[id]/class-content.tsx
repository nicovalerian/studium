'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/documents/file-upload';
import { DocumentList } from '@/components/documents/document-list';
import { FlashcardSection } from '@/components/flashcards/flashcard-section';
import { Flashcard } from '@/components/flashcards/flashcard-item';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { RateLimitTimer } from '@/components/chat/rate-limit-timer';
import { MessageProps } from '@/components/chat/message';

interface Document {
  id: string;
  filename: string;
  display_name: string | null;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface ClassContentProps {
  classId: string;
  initialDocuments: Document[];
}

interface RateLimitState {
  retryAfter: number;
  provider: string;
}

export function ClassContent({ classId, initialDocuments }: ClassContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(
          data.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
        );
      }
    };

    const fetchFlashcards = async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcards:', error);
        return;
      }

      if (data) {
        setFlashcards(data);
      }
    };

    fetchMessages();
    fetchFlashcards();
  }, [classId, supabase]);

  const handleUploadComplete = () => {
    router.refresh();
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: MessageProps = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId, message: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimit({
            retryAfter: data.retry_after,
            provider: data.provider,
          });
          toast({
            title: 'Rate limit reached',
            description: `Please wait ${data.retry_after} seconds before sending another message.`,
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
        return;
      }

      const assistantMessage: MessageProps = { role: 'assistant', content: data.content };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateLimitComplete = () => {
    setRateLimit(null);
    toast({
      title: 'Ready to chat',
      description: 'You can now send messages again.',
    });
  };

  return (
    <>
      <main className="container mx-auto grid h-[calc(100vh-4rem)] gap-6 p-4 lg:grid-cols-3">
        <div className="h-full space-y-6 overflow-y-auto pb-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload classId={classId} onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={initialDocuments} />
            </CardContent>
          </Card>
          <div className="h-[500px]">
            <FlashcardSection
              classId={classId}
              flashcards={flashcards}
              onFlashcardsChange={setFlashcards}
              hasDocuments={initialDocuments.length > 0}
            />
          </div>
        </div>
        <div className="h-full lg:col-span-2">
          <Card className="flex h-full flex-col overflow-hidden border-2 shadow-md">
            <CardHeader className="border-b bg-muted/30 px-6 py-4">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                Study Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              <ChatContainer messages={messages} isLoading={isLoading} />

              <div className="border-t bg-muted/10 p-4">
                {rateLimit ? (
                  <RateLimitTimer
                    retryAfter={rateLimit.retryAfter}
                    onComplete={handleRateLimitComplete}
                  />
                ) : (
                  <ChatInput
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    placeholder={
                      initialDocuments.length === 0
                        ? 'Upload documents to start chatting...'
                        : 'Ask a question about your documents...'
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </>
  );
}
