const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function isHighSurrogate(codeUnit) {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit) {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

function sanitizeUnpairedSurrogates(text) {
  if (!text) return text;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const current = text.charCodeAt(i);

    if (isHighSurrogate(current)) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : -1;
      if (isLowSurrogate(next)) {
        result += text[i] + text[i + 1];
        i++;
      } else {
        result += '\uFFFD';
      }
      continue;
    }

    if (isLowSurrogate(current)) {
      result += '\uFFFD';
      continue;
    }

    result += text[i];
  }

  return result;
}

function makeEndBoundarySafe(text, end) {
  if (end <= 0 || end >= text.length) return end;
  const prev = text.charCodeAt(end - 1);
  const next = text.charCodeAt(end);
  if (isHighSurrogate(prev) && isLowSurrogate(next)) return end - 1;
  return end;
}

function makeStartBoundarySafe(text, start) {
  if (start <= 0 || start >= text.length) return start;
  const prev = text.charCodeAt(start - 1);
  const current = text.charCodeAt(start);
  if (isHighSurrogate(prev) && isLowSurrogate(current)) return start + 1;
  return start;
}

function chunkText(text) {
  const cleanedText = sanitizeUnpairedSurrogates(text);
  const chunks = [];
  let start = 0;
  while (start < cleanedText.length) {
    const unsafeEnd = Math.min(start + CHUNK_SIZE, cleanedText.length);
    const end = makeEndBoundarySafe(cleanedText, unsafeEnd);
    chunks.push(cleanedText.slice(start, end));
    const nextStart = start + CHUNK_SIZE - CHUNK_OVERLAP;
    start = makeStartBoundarySafe(cleanedText, nextStart);
  }
  return chunks;
}

async function generateEmbedding(text, apiKey, model) {
  const safeText = sanitizeUnpairedSurrogates(text);
  const url = `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: safeText }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (Array.isArray(result) && typeof result[0] === 'number') return result;
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  throw new Error(`Unexpected embedding format: ${JSON.stringify(result).slice(0, 300)}`);
}

async function main() {
  const documentId = process.argv[2];
  if (!documentId) {
    console.error('Usage: node scripts/retry-embedding.js <document-id>');
    process.exit(1);
  }

  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const hfModel = process.env.HUGGINGFACE_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

  if (!supabaseUrl || !serviceKey || !hfKey) {
    throw new Error('Missing required env vars in .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, content')
    .eq('id', documentId)
    .single();

  if (fetchError || !doc) {
    throw new Error(`Document fetch failed: ${fetchError ? fetchError.message : 'not found'}`);
  }

  await supabase
    .from('documents')
    .update({ embedding_status: 'processing', error_message: null, updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .throwOnError();

  await supabase.from('document_chunks').delete().eq('document_id', documentId).throwOnError();

  const chunks = chunkText(doc.content || '');
  console.log(`Processing ${documentId}: ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Embedding chunk ${i + 1}/${chunks.length}`);
    const embedding = await generateEmbedding(chunks[i], hfKey, hfModel);
    await supabase
      .from('document_chunks')
      .insert({ document_id: documentId, content: chunks[i], embedding, chunk_index: i })
      .throwOnError();
  }

  await supabase
    .from('documents')
    .update({ embedding_status: 'completed', error_message: null, updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .throwOnError();

  const { count } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('document_id', documentId);

  console.log(`Completed. Chunk count: ${count}`);
}

main().catch(async (err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
