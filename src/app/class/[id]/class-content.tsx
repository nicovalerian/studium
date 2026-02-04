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
import { FileText, Layers, MessageCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex h-screen flex-col bg-warm-50">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-warm-200 bg-white px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warm-800">
              <span className="font-serif text-xs font-medium text-warm-50">S</span>
            </div>
            <span className="font-serif text-base font-medium text-warm-800">Studium</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="flex w-80 shrink-0 flex-col border-r border-warm-200 bg-white">
            <div className="flex border-b border-warm-200">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-terracotta text-terracotta'
                    : 'border-transparent text-warm-500 hover:text-warm-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'flashcards'
                    ? 'border-terracotta text-terracotta'
                    : 'border-transparent text-warm-500 hover:text-warm-700'
                }`}
              >
                <Layers className="h-4 w-4" />
                Flashcards
                {flashcards.length > 0 && (
                  <span className="rounded-full bg-warm-200 px-1.5 py-0.5 text-xs text-warm-600">
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
                  hasDocuments={initialDocuments.length > 0}
                />
              )}
            </div>
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-warm-200 bg-white px-4">
              <MessageCircle className="h-4 w-4 text-terracotta" />
              <span className="text-sm font-medium text-warm-700">Chat with your notes</span>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-warm-50 to-white">
              <ChatContainer messages={messages} isLoading={isLoading} />

              <div className="shrink-0 border-t border-warm-200 bg-white p-4">
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
