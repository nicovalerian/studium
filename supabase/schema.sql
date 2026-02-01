-- Studium Database Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT classes_user_id_unique UNIQUE (user_id)
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  display_name TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document chunks with embeddings (384 dimensions for HuggingFace all-MiniLM-L6-v2)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT document_chunks_unique_index UNIQUE (document_id, chunk_index)
);

-- Messages (chat history)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flashcards
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(384),
  match_threshold FLOAT,
  match_count INT,
  filter_class_id UUID
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_name TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    COALESCE(documents.display_name, documents.filename) AS document_name,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  JOIN documents ON documents.id = document_chunks.document_id
  WHERE documents.class_id = filter_class_id
    AND documents.embedding_status = 'completed'
    AND document_chunks.embedding IS NOT NULL
    AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS Policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- CLASSES policies
CREATE POLICY "classes_select" ON classes FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "classes_insert" ON classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "classes_update" ON classes FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "classes_delete" ON classes FOR DELETE
  USING (auth.uid() = user_id);

-- DOCUMENTS policies
CREATE POLICY "documents_select" ON documents FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "documents_insert" ON documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "documents_update" ON documents FOR UPDATE
  USING (auth.uid() = user_id) 
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "documents_delete" ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- DOCUMENT_CHUNKS policies (read-only for users, INSERT via service role)
CREATE POLICY "document_chunks_select" ON document_chunks FOR SELECT
  USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));

-- MESSAGES policies
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (auth.uid() = user_id) 
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "messages_delete" ON messages FOR DELETE
  USING (auth.uid() = user_id);

-- FLASHCARDS policies
CREATE POLICY "flashcards_select" ON flashcards FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "flashcards_insert" ON flashcards FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "flashcards_update" ON flashcards FOR UPDATE
  USING (auth.uid() = user_id) 
  WITH CHECK (
    auth.uid() = user_id 
    AND class_id IN (SELECT id FROM classes WHERE user_id = auth.uid())
  );
CREATE POLICY "flashcards_delete" ON flashcards FOR DELETE
  USING (auth.uid() = user_id);
