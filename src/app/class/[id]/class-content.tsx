'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/documents/file-upload';
import { DocumentList } from '@/components/documents/document-list';
import { FlashcardSection } from '@/components/flashcards/flashcard-section';
import { Flashcard } from '@/components/flashcards/flashcard-item';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { RateLimitTimer } from '@/components/chat/rate-limit-timer';
import { MessageProps } from '@/components/chat/message';
import { Logo } from '@/components/branding/logo';
import {
  FileText,
  Layers,
  MessageCircle,
  User as UserIcon,
  LogOut,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import {
  buildLoginHref,
  canUseWorkspace,
  EMAIL_VERIFICATION_REQUIRED_ERROR_CODE,
  type WorkspaceAccessState,
} from '@/lib/auth/access';
import { WorkspaceAccessBanner, WorkspaceAccessDialog } from '@/components/auth/access-gate';
import { DesktopOnlyGate } from '@/components/layout/desktop-only-gate';

interface Document {
  id: string;
  filename: string;
  display_name: string | null;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface ClassContentProps {
  classId: string | null;
  initialDocuments: Document[];
  user: User | null;
  workspaceState: WorkspaceAccessState;
  workspacePath: string;
}

interface RateLimitState {
  retryAfter: number;
  provider: string;
}

type BlockedAction = 'chat' | 'upload' | 'flashcards' | 'clear-chat';

function buildCallbackUrl(nextPath: string) {
  const confirmUrl = new URL('/auth/confirm', window.location.origin);
  confirmUrl.searchParams.set('next', nextPath);
  return confirmUrl.toString();
}

export function ClassContent({
  classId,
  initialDocuments,
  user,
  workspaceState,
  workspacePath,
}: ClassContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const profileControlsRef = useRef<HTMLDivElement>(null);
  const loginHref = buildLoginHref(workspacePath);
  const signupHref = buildLoginHref(workspacePath, 'signup');
  const workspaceEnabled = canUseWorkspace(workspaceState);
  const isReadOnly = !workspaceEnabled;

  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'flashcards'>('documents');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [blockedAction, setBlockedAction] = useState<BlockedAction | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileControlsRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isProfileMenuOpen]);

  const refreshDocuments = useCallback(async () => {
    if (!classId || !user) return;

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
  }, [classId, supabase, user]);

  useEffect(() => {
    if (!classId || !user) return;

    let cancelled = false;

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

      if (!cancelled && data) {
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

      if (!cancelled && data) {
        setFlashcards(data);
      }
    };

    void fetchMessages();
    void fetchFlashcards();

    return () => {
      cancelled = true;
    };
  }, [classId, supabase, user]);

  const handleUploadComplete = () => {
    void refreshDocuments();
    router.refresh();
  };

  useEffect(() => {
    if (!classId || !user) return;

    const hasPending = documents.some(
      (doc) => doc.embedding_status === 'pending' || doc.embedding_status === 'processing'
    );

    if (!hasPending) return;

    const intervalId = setInterval(() => {
      void refreshDocuments();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [classId, documents, refreshDocuments, user]);

  const openBlockedPrompt = useCallback((action: BlockedAction) => {
    setBlockedAction(action);
  }, []);

  const handleResendVerification = useCallback(async () => {
    if (!user?.email) return;

    setIsResendingVerification(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: buildCallbackUrl(workspacePath),
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Verification email resent',
        description: `A fresh confirmation link is on its way to ${user.email}.`,
      });
    } catch (error) {
      toast({
        title: 'Could not resend email',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResendingVerification(false);
    }
  }, [supabase, toast, user?.email, workspacePath]);

  const handleSendMessage = async (content: string) => {
    if (!workspaceEnabled) {
      openBlockedPrompt('chat');
      return;
    }

    if (!classId || isClearingChat) return;

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
          router.push(loginHref);
        } else if (
          response.status === 403 &&
          data.code === EMAIL_VERIFICATION_REQUIRED_ERROR_CODE
        ) {
          openBlockedPrompt('chat');
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

  const handleClearChat = async () => {
    if (!workspaceEnabled) {
      openBlockedPrompt('clear-chat');
      return;
    }

    if (!classId || isLoading || isClearingChat || messages.length === 0) return;

    setIsClearingChat(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId }),
      });

      let data: Record<string, unknown> = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Session expired',
            description: 'Please sign in again to continue chatting.',
            variant: 'destructive',
          });
          router.push(loginHref);
          return;
        }

        if (response.status === 403 && data.code === EMAIL_VERIFICATION_REQUIRED_ERROR_CODE) {
          openBlockedPrompt('clear-chat');
          return;
        }

        const serverError = typeof data.error === 'string' ? data.error : null;
        throw new Error(serverError || 'Failed to clear chat history.');
      }

      setMessages([]);
      setRateLimit(null);
      toast({
        title: 'Chat cleared',
        description: 'This chat context has been reset.',
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: 'Failed to clear chat',
        description: error instanceof Error ? error.message : 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsClearingChat(false);
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
    if (!user) {
      router.push(loginHref);
      return;
    }

    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setIsProfileMenuOpen(false);
    router.push('/login');
  };

  return (
    <DesktopOnlyGate>
      <>
      <div className="flex h-svh flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to Studium home">
              <Logo size="sm" showTagline tagline="Study with flow" />
            </Link>
          </div>

          {user ? (
            <div ref={profileControlsRef} className="flex items-center gap-2">
              <div
                className={`origin-right overflow-hidden transition-all duration-300 ease-out ${
                  isProfileMenuOpen
                    ? 'max-w-[160px] translate-x-0 opacity-100'
                    : 'pointer-events-none max-w-0 translate-x-2 opacity-0'
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 whitespace-nowrap"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Sign out
                </Button>
              </div>

              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                title="Profile"
                aria-label="Open profile actions"
                aria-expanded={isProfileMenuOpen}
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
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push(loginHref)}>
                Sign in
              </Button>
              <Button type="button" size="sm" onClick={() => router.push(signupHref)}>
                Create account
              </Button>
            </div>
          )}
        </header>

        {workspaceState !== 'verified' ? (
          <WorkspaceAccessBanner
            state={workspaceState}
            email={user?.email}
            isResendingVerification={isResendingVerification}
            onResendVerification={handleResendVerification}
            onRefresh={() => router.refresh()}
          />
        ) : null}

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
                {flashcards.length > 0 ? (
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                    {flashcards.length}
                  </span>
                ) : null}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'documents' ? (
                <div className="space-y-4">
                  <FileUpload
                    classId={classId}
                    onUploadComplete={handleUploadComplete}
                    workspaceState={workspaceState}
                    onBlockedAction={() => openBlockedPrompt('upload')}
                  />
                  <DocumentList
                    documents={documents}
                    onDocumentsDeleted={() => void refreshDocuments()}
                    isReadOnly={isReadOnly}
                    blurEmptyState={workspaceState === 'guest'}
                  />
                </div>
              ) : (
                <FlashcardSection
                  classId={classId}
                  flashcards={flashcards}
                  onFlashcardsChange={setFlashcards}
                  hasDocuments={documents.some((doc) => doc.embedding_status === 'completed')}
                  workspaceState={workspaceState}
                  onBlockedAction={() => openBlockedPrompt('flashcards')}
                />
              )}
            </div>
          </aside>

          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Chat with your notes</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                onClick={handleClearChat}
                disabled={workspaceEnabled ? isLoading || isClearingChat || messages.length === 0 : false}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isClearingChat ? 'Clearing...' : 'Clear chat'}
              </Button>
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
                    isLoading={isLoading || isClearingChat}
                    workspaceState={workspaceState}
                    onBlockedAction={() => openBlockedPrompt('chat')}
                    placeholder={
                      workspaceState === 'guest'
                        ? 'Sign in to ask about your notes...'
                        : workspaceState === 'unverified'
                          ? 'Verify your email to unlock chat...'
                          : documents.length === 0
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

      {workspaceState !== 'verified' ? (
        <WorkspaceAccessDialog
          state={workspaceState}
          action={blockedAction}
          email={user?.email}
          nextPath={workspacePath}
          open={blockedAction !== null}
          onOpenChange={(open) => {
            if (!open) {
              setBlockedAction(null);
            }
          }}
          isResendingVerification={isResendingVerification}
          onResendVerification={handleResendVerification}
        />
      ) : null}

      <Toaster />
      </>
    </DesktopOnlyGate>
  );
}
