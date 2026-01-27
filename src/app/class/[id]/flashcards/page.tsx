import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FlashcardReview } from '@/components/flashcards/flashcard-review';
import { UserNav } from '@/components/auth/user-nav';

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
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">{classData.name} - Study Mode</h1>
          <UserNav user={user} />
        </div>
      </header>
      <main className="container mx-auto px-4">
        <FlashcardReview flashcards={flashcards || []} classId={id} />
      </main>
    </div>
  );
}
