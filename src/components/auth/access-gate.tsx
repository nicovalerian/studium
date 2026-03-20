'use client';

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { buildLoginHref, type WorkspaceAccessState } from '@/lib/auth/access';
import { Loader2, Lock, MailCheck, Sparkles } from 'lucide-react';

type GuardedWorkspaceState = Exclude<WorkspaceAccessState, 'verified'>;
type GuardedAction =
  | 'chat'
  | 'upload'
  | 'flashcards'
  | 'clear-chat'
  | 'flashcard-edit'
  | 'document-manage';

interface WorkspaceAccessBannerProps {
  state: GuardedWorkspaceState;
  email?: string | null;
  isResendingVerification?: boolean;
  onResendVerification?: () => void;
  onRefresh?: () => void;
}

interface WorkspaceAccessDialogProps {
  state: GuardedWorkspaceState;
  action: GuardedAction | null;
  email?: string | null;
  nextPath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isResendingVerification?: boolean;
  onResendVerification?: () => void;
}

const actionLabels: Record<GuardedAction, string> = {
  chat: 'chat with your notes',
  upload: 'upload files',
  flashcards: 'generate flashcards',
  'clear-chat': 'clear chat history',
  'flashcard-edit': 'edit flashcards',
  'document-manage': 'manage documents',
};

export function WorkspaceAccessBanner({
  state,
  email,
  isResendingVerification = false,
  onResendVerification,
  onRefresh,
}: WorkspaceAccessBannerProps) {
  if (state === 'guest') {
    return (
      <div className="border-b border-border bg-[linear-gradient(90deg,rgba(59,130,246,0.06),rgba(16,185,129,0.04))] px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Guest preview is live</p>
              <p className="text-sm text-muted-foreground">
                Explore the dashboard first. Sign in when you are ready to upload files, chat, and
                generate flashcards. Use the navbar whenever you want to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-[linear-gradient(90deg,rgba(245,158,11,0.1),rgba(244,63,94,0.04))] px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Verify your email to unlock Studium</p>
            <p className="text-sm text-muted-foreground">
              {email ? `We sent a verification link to ${email}. ` : null}
              Uploads, chat, and flashcard generation stay locked until your email is confirmed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isResendingVerification}
          >
            Refresh status
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onResendVerification}
            disabled={!email || isResendingVerification}
          >
            {isResendingVerification ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Resend email
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceAccessDialog({
  state,
  action,
  email,
  nextPath,
  open,
  onOpenChange,
  isResendingVerification = false,
  onResendVerification,
}: WorkspaceAccessDialogProps) {
  const router = useRouter();
  const actionLabel = action ? actionLabels[action] : 'use this workspace';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            {state === 'guest' ? (
              <Lock className="h-5 w-5 text-primary" />
            ) : (
              <MailCheck className="h-5 w-5 text-amber-600" />
            )}
            {state === 'guest' ? 'Sign in to continue' : 'Verify your email first'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {state === 'guest'
              ? `You can browse the dashboard as a guest, but you need an account to ${actionLabel}.`
              : `${email ? `We sent a verification link to ${email}. ` : ''}Please confirm that email before you ${actionLabel}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Not now</AlertDialogCancel>
          {state === 'guest' ? (
            <Button type="button" onClick={() => router.push(buildLoginHref(nextPath))}>
              Continue to sign in
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onResendVerification}
              disabled={!email || isResendingVerification}
            >
              {isResendingVerification ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Resend verification
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
