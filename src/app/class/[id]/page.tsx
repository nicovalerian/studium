import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClassContent } from './class-content';
import { getWorkspaceAccessState } from '@/lib/auth/access';

interface ClassPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(`/class/${id}`)}`);

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
    <ClassContent
      classId={id}
      initialDocuments={documents || []}
      user={user}
      workspacePath={`/class/${id}`}
      workspaceState={getWorkspaceAccessState(user)}
    />
  );
}
