import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FlashcardReview } from '@/components/flashcards/flashcard-review';
import { UserNav } from '@/components/auth/user-nav';
import { Logo } from '@/components/branding/logo';
import { DesktopOnlyGate } from '@/components/layout/desktop-only-gate';

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: classData } = await supabase
    .from('classes')
    .select('name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!classData) redirect('/dashboard');

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('class_id', id)
    .order('created_at', { ascending: true });

  return (
    <DesktopOnlyGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-warm-200 bg-card">
          <div className="container mx-auto flex min-h-16 items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href={`/class/${id}`}
                aria-label="Back to your workspace"
                className="shrink-0 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Logo size="sm" />
              </Link>
              <span className="hidden h-8 w-px bg-warm-200 sm:block" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-warm-900">{classData.name}</h1>
                <p className="text-sm text-warm-500">Flashcard review</p>
              </div>
            </div>
            <UserNav user={user} />
          </div>
        </header>
        <main id="main-content" className="container mx-auto px-4" tabIndex={-1}>
          <FlashcardReview flashcards={flashcards || []} classId={id} />
        </main>
      </div>
    </DesktopOnlyGate>
  );
}
