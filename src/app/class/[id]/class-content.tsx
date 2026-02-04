'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const refreshDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, display_name, embedding_status, created_at')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    setDocuments(data || []);
  }, [classId, supabase]);

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
    refreshDocuments();
    router.refresh();
  };

  useEffect(() => {
    const hasPending = documents.some(
      (doc) => doc.embedding_status === 'pending' || doc.embedding_status === 'processing'
    );

    if (!hasPending) return;

    const intervalId = setInterval(() => {
      refreshDocuments();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [documents, refreshDocuments]);

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

      let data: Record<string, unknown> = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (error) {
          console.error('Failed to parse chat response JSON:', error);
          throw new Error('Invalid server response. Please try again.');
        }
      }

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = typeof data.retry_after === 'number' ? data.retry_after : 60;
          const provider = typeof data.provider === 'string' ? data.provider : 'do-gradient';
          setRateLimit({ retryAfter, provider });
          toast({
            title: 'Rate limit reached',
            description: `Please wait ${retryAfter} seconds before sending another message.`,
            variant: 'destructive',
          });
        } else if (response.status === 401) {
          toast({
            title: 'Session expired',
            description: 'Please sign in again to continue chatting.',
            variant: 'destructive',
          });
          router.push('/login');
        } else {
          const serverError = typeof data.error === 'string' ? data.error : null;
          throw new Error(serverError || `Failed to send message (${response.status}).`);
        }
        return;
      }

      const assistantContent = typeof data.content === 'string' ? data.content : '';
      const assistantMessage: MessageProps = { role: 'assistant', content: assistantContent };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const message = error instanceof Error ? error.message : 'Failed to send message.';
      toast({
        title: 'Error',
        description: message,
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
              <DocumentList documents={documents} />
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
                      documents.length === 0
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
