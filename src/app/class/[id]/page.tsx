import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserNav } from '@/components/auth/user-nav';
import { ClassContent } from './class-content';

interface ClassPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: classData } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!classData) redirect('/dashboard');

  const { data: documents } = await supabase
    .from('documents')
    .select('id, filename, display_name, embedding_status, created_at')
    .eq('class_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">{classData.name}</h1>
          <UserNav user={user} />
        </div>
      </header>
      <ClassContent classId={id} initialDocuments={documents || []} />
    </div>
  );
}
