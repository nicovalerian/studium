import { SupabaseClient } from '@supabase/supabase-js';
import { generateEmbedding } from './huggingface';
import type { DocumentChunk } from '../ai/types';

const MAX_CONTEXT_LENGTH = 4000;
const FALLBACK_THRESHOLDS = [0.55, 0.4, 0.2, 0];

async function matchChunks(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  classId: string,
  threshold: number,
  maxCount: number
): Promise<DocumentChunk[]> {
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: maxCount,
    filter_class_id: classId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as DocumentChunk[];
}

export async function searchSimilarChunks(
  supabase: SupabaseClient,
  classId: string,
  query: string,
  threshold: number = 0.7,
  maxCount: number = 5
): Promise<DocumentChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const candidateThresholds = Array.from(new Set([threshold, ...FALLBACK_THRESHOLDS])).sort(
      (a, b) => b - a
    );

    for (const candidateThreshold of candidateThresholds) {
      try {
        const chunks = await matchChunks(
          supabase,
          queryEmbedding,
          classId,
          candidateThreshold,
          maxCount
        );

        if (chunks.length > 0) {
          return chunks;
        }
      } catch (error) {
        console.error('Error searching chunks:', {
          classId,
          threshold: candidateThreshold,
          error,
        });
      }
    }

    return [];
  } catch (error) {
    console.error('Failed to generate query embedding:', error);
    return [];
  }
}

export function buildContext(chunks: DocumentChunk[]): string {
  if (!chunks || chunks.length === 0) return '';

  let context = '';
  for (const chunk of chunks) {
    const sourceLabel = chunk.document_name?.trim() || 'Uploaded document';
    const block = `[Source: ${sourceLabel}]\n${chunk.content.trim()}\n\n`;

    if (context.length + block.length > MAX_CONTEXT_LENGTH) {
      break;
    }

    context += block;
  }

  return context.trim();
}
