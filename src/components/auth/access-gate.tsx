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
import { Eye, Loader2, Lock, MailCheck } from 'lucide-react';

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
      <div role="status" className="border-b border-border bg-secondary/60 px-4 py-2.5 sm:px-6">
        <div className="flex items-start gap-2.5">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-warm-600">
            <span className="font-semibold text-foreground">Guest preview.</span> Explore the
            dashboard first. Sign in when you are ready to upload files, chat, and generate
            flashcards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2.5">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Verify your email to unlock Studium
            </p>
            <p className="text-sm text-amber-900">
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
              <MailCheck className="h-5 w-5 text-amber-700" />
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
