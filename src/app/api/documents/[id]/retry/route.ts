import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateDocumentEmbeddings } from '@/lib/embeddings/generate';

const STUCK_THRESHOLD_MS = 20 * 60 * 1000;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    .select('id, content, embedding_status, processing_started_at')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const isStuck =
    document.embedding_status === 'processing' &&
    document.processing_started_at &&
    Date.now() - new Date(document.processing_started_at).getTime() > STUCK_THRESHOLD_MS;

  if (document.embedding_status !== 'failed' && !isStuck) {
    return NextResponse.json(
      { error: 'Document cannot be retried. Status must be failed or stuck in processing.' },
      { status: 400 }
    );
  }

  const embeddingResult = await generateDocumentEmbeddings(supabase, documentId, document.content);

  return NextResponse.json({
    document_id: documentId,
    embedding_status: embeddingResult.embedding_status,
    error_message: embeddingResult.error_message,
  });
}
