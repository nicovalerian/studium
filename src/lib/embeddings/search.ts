import { SupabaseClient } from '@supabase/supabase-js';
import { generateEmbedding } from './huggingface';
import type { DocumentChunk } from '../ai/types';

const MAX_CONTEXT_LENGTH = 4000;

export async function searchSimilarChunks(
  supabase: SupabaseClient,
  classId: string,
  query: string,
  threshold: number = 0.7,
  maxCount: number = 5
): Promise<DocumentChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: maxCount,
      filter_class_id: classId,
    });

    if (error) {
      console.error('Error searching chunks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to generate query embedding:', error);
    return [];
  }
}

export function buildContext(chunks: DocumentChunk[]): string {
  if (!chunks || chunks.length === 0) return '';

  let context = '';
  for (const chunk of chunks) {
    if (context.length + chunk.content.length > MAX_CONTEXT_LENGTH) {
      break;
    }
    context += chunk.content + '\n\n';
  }

  return context.trim();
}
