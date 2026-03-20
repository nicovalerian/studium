import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FlashcardReview } from '@/components/flashcards/flashcard-review';
import { UserNav } from '@/components/auth/user-nav';
import { Logo } from '@/components/branding/logo';

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex min-h-16 flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/class/${id}`} className="transition-opacity hover:opacity-90">
              <Logo size="sm" />
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Study mode
              </p>
              <h1 className="text-xl font-semibold text-foreground">{classData.name}</h1>
            </div>
          </div>
          <UserNav user={user} />
        </div>
      </header>
      <main className="container mx-auto px-4">
        <FlashcardReview flashcards={flashcards || []} classId={id} />
      </main>
    </div>
  );
}
