import type { User } from '@supabase/supabase-js';

export type WorkspaceAccessState = 'guest' | 'unverified' | 'verified';
export type AuthMode = 'signin' | 'signup';

export const EMAIL_VERIFICATION_REQUIRED_ERROR_CODE = 'email_verification_required';

export function getWorkspaceAccessState(user: User | null | undefined): WorkspaceAccessState {
  if (!user) {
    return 'guest';
  }

  return user.email_confirmed_at ? 'verified' : 'unverified';
}

export function canUseWorkspace(state: WorkspaceAccessState) {
  return state === 'verified';
}

export function buildLoginHref(nextPath: string, mode: AuthMode = 'signin') {
  const params = new URLSearchParams({ next: getSafeNextPath(nextPath) });

  if (mode === 'signup') {
    params.set('mode', 'signup');
  }

  return `/login?${params.toString()}`;
}

export function getSafeNextPath(nextPath: string | null | undefined, fallback = '/dashboard') {
  if (!nextPath || !nextPath.startsWith('/')) {
    return fallback;
  }

  return nextPath.startsWith('//') ? fallback : nextPath;
}
