import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('embedding_status, error_message, updated_at')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  let chunkCount: number | undefined;
  if (document.embedding_status === 'completed') {
    const { count } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId);
    chunkCount = count ?? undefined;
  }

  return NextResponse.json({
    embedding_status: document.embedding_status,
    error_message: document.error_message,
    updated_at: document.updated_at,
    chunk_count: chunkCount,
  });
}
