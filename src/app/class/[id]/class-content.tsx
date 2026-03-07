'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/documents/file-upload';
import { DocumentList } from '@/components/documents/document-list';
import { FlashcardSection } from '@/components/flashcards/flashcard-section';
import { Flashcard } from '@/components/flashcards/flashcard-item';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { RateLimitTimer } from '@/components/chat/rate-limit-timer';
import { MessageProps } from '@/components/chat/message';
import { FileText, Layers, MessageCircle, User as UserIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';

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
  user: User;
}

interface RateLimitState {
  retryAfter: number;
  provider: string;
}

export function ClassContent({ classId, initialDocuments, user }: ClassContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'flashcards'>('documents');

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <div className="flex h-svh flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={2.5} />
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              Studium
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-transparent ring-offset-background transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.email || 'User'}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="relative z-10 flex w-80 shrink-0 flex-col border-r border-border bg-card">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'flashcards'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
                Flashcards
                {flashcards.length > 0 && (
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                    {flashcards.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'documents' ? (
                <div className="space-y-4">
                  <FileUpload classId={classId} onUploadComplete={handleUploadComplete} />
                  <DocumentList documents={documents} onDocumentsDeleted={refreshDocuments} />
                </div>
              ) : (
                <FlashcardSection
                  classId={classId}
                  flashcards={flashcards}
                  onFlashcardsChange={setFlashcards}
                  hasDocuments={documents.some((doc) => doc.embedding_status === 'completed')}
                />
              )}
            </div>
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Chat with your notes</span>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-background to-card">
              <ChatContainer messages={messages} isLoading={isLoading} />

              <div className="shrink-0 border-t border-border bg-card p-4">
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
                        : 'Ask something about your notes...'
                    }
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
