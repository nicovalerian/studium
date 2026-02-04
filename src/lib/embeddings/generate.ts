import { createClient as createServiceClient } from '@supabase/supabase-js';
import { chunkText } from './chunker';
import { generateEmbedding } from './huggingface';

const STUCK_THRESHOLD_MS = 20 * 60 * 1000;

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function generateDocumentEmbeddings(
  _userSupabase: unknown,
  documentId: string,
  content: string
): Promise<{ embedding_status: 'completed' | 'failed'; error_message?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    return {
      embedding_status: 'failed',
      error_message: 'Server configuration error: missing database credentials',
    };
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const processingTimestamp = new Date().toISOString();
  const stuckThreshold = new Date(Date.now() - STUCK_THRESHOLD_MS).toISOString();

  const { data: claimed, error: claimError } = await serviceSupabase
    .from('documents')
    .update({
      embedding_status: 'processing',
      processing_started_at: processingTimestamp,
      updated_at: processingTimestamp,
    })
    .eq('id', documentId)
    .or(
      `embedding_status.eq.pending,embedding_status.eq.failed,and(embedding_status.eq.processing,processing_started_at.lt.${stuckThreshold})`
    )
    .select()
    .single();

  if (claimError) {
    console.error('Embedding claim error:', claimError);
    await markDocumentFailed(
      serviceSupabase,
      documentId,
      `Failed to claim document for processing: ${claimError.message}`
    );
    return {
      embedding_status: 'failed',
      error_message: `Database error: ${claimError.message}`,
    };
  }

  if (!claimed) {
    console.error('Document claim returned no data - document may already be processing');
    return {
      embedding_status: 'failed',
      error_message: 'Document is already being processed by another request',
    };
  }

  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Document content is empty');
    }

    await serviceSupabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId)
      .throwOnError();

    const chunks = chunkText(content);
    console.log(`Processing document ${documentId}: ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No chunks generated from document content');
    }

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      console.log(`Generating embedding for chunk ${index + 1}/${chunks.length}`);
      const embedding = await withRetry(() => generateEmbedding(chunk), 3, 1000);
      await serviceSupabase
        .from('document_chunks')
        .insert({
          document_id: documentId,
          content: chunk,
          embedding: embedding,
          chunk_index: index,
        })
        .throwOnError();
    }

    await serviceSupabase
      .from('documents')
      .update({
        embedding_status: 'completed',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .throwOnError();

    console.log(`Document ${documentId} embedding completed successfully`);
    return { embedding_status: 'completed' };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during embedding generation';
    console.error(`Document ${documentId} embedding failed:`, errorMessage);

    await markDocumentFailed(serviceSupabase, documentId, errorMessage);

    return { embedding_status: 'failed', error_message: errorMessage };
  }
}

async function markDocumentFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  documentId: string,
  errorMessage: string
): Promise<void> {
  try {
    await supabase
      .from('documents')
      .update({
        embedding_status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);
  } catch (updateError) {
    console.error('Failed to update document status to failed:', updateError);
  }
}
