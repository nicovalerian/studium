# Studium - AI Study Buddy MVP

## Context

### Original Request
Build "Studium" - an AI-powered study companion web app for a fresh graduate portfolio. The app allows students to upload course materials (PDF/DOCX), chat with an AI about the content, and generate flashcards for studying. Must be deployable for free (leveraging GitHub Student Developer Pack credits) and impressive to hiring managers.

### Interview Summary
**Key Discussions**:
- Platform: Web app only (Next.js 14)
- MVP Scope: Lean MVP with ~3 week timeline, phased features
- UI Style: Duolingo-inspired (colorful, friendly) but no gamification mechanics
- Auth: Google OAuth via Supabase Auth
- File Processing: Text extraction only (no OCR)
- Flashcards: Basic front/back for MVP, spaced repetition in Phase 2
- Model Selection: Free tiers (Groq → Gemini fallback) + BYOK in Phase 2
- Localization: English only, i18n infrastructure ready
- Chat History: Persistent across sessions
- Testing: Automated tests with Vitest

### GitHub Student Developer Pack Benefits (LEVERAGE THESE!)

| Benefit | Value | Duration | Use For |
|---------|-------|----------|---------|
| **DigitalOcean** | $200 credit | 1 year | Backend hosting, database |
| **Azure** | $100 credit | 1 year | Azure OpenAI for embeddings (better than free HF) |
| **Heroku** | $13/month | 24 months ($312) | Alternative hosting |
| **MongoDB Atlas** | $50 credit | - | Alternative to Supabase if needed |
| **.TECH Domain** | Free | 1 year | studium.tech domain |
| **Namecheap** | Free .me domain + SSL | 1 year | Alternative domain |
| **GitHub Copilot Pro** | Free | While student | Development assistance |
| **JetBrains** | Free subscription | 1 year | WebStorm/IDE |

**REVISED DEPLOYMENT STRATEGY**:
Instead of Vercel free tier limits, use:
- **DigitalOcean App Platform** ($200 credit) - More generous than Vercel free
- **Azure OpenAI** ($100 credit) - Better embeddings than free HuggingFace
- **studium.tech** domain - Professional look

### Research Findings
- RAG systems are #1 in-demand skill for AI portfolios
- Groq free tier: 7,000 requests/day (llama-3.1-8b), 1,000/day (llama-3.3-70b)
- Azure OpenAI: text-embedding-3-small at $0.02/1M tokens (covered by $100 credit)
- DigitalOcean App Platform: $5/month for basic app (40 months of hosting with $200!)

### Metis Review - Identified Gaps (addressed)
- Embedding model choice: **UPGRADED** to Azure OpenAI text-embedding-3-small (better quality, covered by student credits)
- File size limits: 10MB max enforced client + server
- Chat history: Persistent in Supabase
- Rate limit UX: Retry timer with friendly message
- Lighthouse target: 90+ score

---

## Work Objectives

### Core Objective
Build a production-ready AI study companion that demonstrates RAG implementation, modern full-stack development, and clean UI/UX for portfolio presentation.

### Concrete Deliverables
- `/` - Landing page with value proposition
- `/login` - Google OAuth authentication
- `/dashboard` - Class overview (single class for MVP)
- `/class/[id]` - Main study interface with chat + files + flashcards
- `/class/[id]/flashcards` - Flashcard review mode
- API routes for embedding generation (using Azure OpenAI)
- GitHub repository with CI/CD via GitHub Actions
- Live deployment on **DigitalOcean App Platform** at **studium.tech**

### Definition of Done
- [ ] `pnpm build` completes without errors
- [ ] `pnpm test` passes all tests
- [ ] Lighthouse score >= 90 on public pages (`/`, `/login`)
- [ ] E2E tests pass for authenticated flows (via Playwright)
- [ ] User can sign in with Google
- [ ] User can upload PDF/DOCX and chat about content
- [ ] User can generate and review flashcards
- [ ] App deployed and accessible at studium.tech (or similar)

### Must Have
- Google OAuth authentication
- Single "Class" with document upload (PDF/DOCX, max 10MB)
- RAG-powered chat with context from uploaded documents
- Flashcard generation from document content
- Markdown rendering with code syntax highlighting
- Copy-to-clipboard for AI responses
- Groq → Gemini fallback with retry timer
- Persistent chat history
- Mobile-responsive design
- 90+ Lighthouse score

### Must NOT Have (Guardrails)
- No multiple classes (Phase 2)
- No spaced repetition algorithm (Phase 2)
- No quiz feature (Phase 2)
- No BYOK model selection (Phase 2)
- No tiered pricing UI (Phase 2)
- No image OCR or audio transcription
- No real-time WebSocket features
- No email notifications
- No analytics/tracking
- No custom auth (Supabase only)
- No streaming responses (adds complexity)
- No `getSession()` in Server Components (security - use `getUser()`)

### Single Class Behavior (MVP Simplification)
**Decision**: Auto-create a default class on first login.

**Implementation Point**: `/dashboard/page.tsx` (Server Component)
- **Trigger**: When authenticated user visits `/dashboard`
- **Helper Function**: Use `createClient` from `@/lib/supabase/server` (this is the standard @supabase/ssr server helper)
- **Logic Flow**:
  ```typescript
  // In src/app/dashboard/page.tsx
  import { createClient } from '@/lib/supabase/server';
  import { redirect } from 'next/navigation';
  
  export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) redirect('/login');
    
    // 1. Check for existing class using maybeSingle() (returns null instead of error on 0 rows)
    const { data: existingClass, error: selectError } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (selectError) {
      console.error('Error checking for class:', selectError);
      throw new Error('Failed to check for existing class');
    }
    
    // 2. If class exists, redirect immediately
    if (existingClass) {
      redirect(`/class/${existingClass.id}`);
    }
    
    // 3. If no class, create one (handles race condition with unique constraint)
    const { data: newClass, error: insertError } = await supabase
      .from('classes')
      .insert({ user_id: user.id, name: 'My Study Materials' })
      .select('id')
      .single();
    
    // 4. Handle race condition: if insert fails due to existing class, fetch it
    if (insertError?.code === '23505') { // Unique constraint violation
      const { data: raceClass } = await supabase
        .from('classes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (raceClass) redirect(`/class/${raceClass.id}`);
    }
    
    if (insertError && insertError.code !== '23505') {
      console.error('Error creating class:', insertError);
      throw new Error('Failed to create class');
    }
    
    if (newClass) redirect(`/class/${newClass.id}`);
    
    // 5. Fallback: Show loading while creating (should never reach in practice)
    return <div>Getting started...</div>;
  }
  ```
- **Key Implementation Details**:
  - Use `maybeSingle()` instead of `single()` for the initial check (returns `null` instead of error on 0 rows)
  - Use `single()` for the insert (we expect exactly one row back)
  - `createClient` is async in @supabase/ssr (needs `await`)
- **Idempotency**: Uses unique constraint on (user_id) in classes table + error handling for race conditions
- **Database Constraint**: The unique constraint `classes_user_id_unique` is already defined in the `CREATE TABLE classes` statement in the schema (TODO 1). Do not add it separately.
- **No UI for class creation**: Dashboard is just a redirect; class view has all functionality

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: Will be created (Vitest)
- **User wants tests**: Automated tests for critical paths
- **Framework**: Vitest + React Testing Library

### Test Coverage Requirements
- Auth flow (login, logout, session refresh)
- File upload validation and processing
- AI service fallback logic
- Flashcard generation
- API route error handling

### Manual QA Checkpoints
Each TODO includes verification steps for visual/interactive testing.

---

## Tech Stack

### Frontend
```
next: ^14.2.0
react: ^18.2.0    # Next 14.2 peer dependency; 18.2.x or 18.3.x both compatible
react-dom: ^18.2.0
typescript: ^5.4.0
tailwindcss: ^3.4.0
@shadcn/ui: latest
react-markdown: ^9.0.0
rehype-highlight: ^7.0.0
```

### Backend/Database
```
@supabase/ssr: ^0.8.0
@supabase/supabase-js: ^2.58.0
```

### AI/ML
```
groq-sdk: ^0.37.0
@google/genai: ^0.8.0
openai: ^4.0.0          # For Azure OpenAI embeddings
```

### File Processing
```
unpdf: ^1.4.0
mammoth: ^1.11.0
```

### Validation
```
zod: ^3.23.0               # JSON schema validation for flashcard responses
```

### Testing
```
vitest: ^2.0.0
@testing-library/react: ^16.0.0
@vitejs/plugin-react: ^4.3.0
```

---

## Environment Variables (Authoritative List)

### Required Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Public** | Supabase project URL. Safe to expose (only identifies project). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Public** | Supabase anonymous/public key. Safe to expose (RLS enforces security). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** | Supabase service role key. NEVER expose to client. Used in `/api/upload` and `/api/documents/[id]/retry` for `document_chunks` DELETE + INSERT. |
| `AZURE_OPENAI_API_KEY` | **Server-only** | Azure OpenAI API key for embeddings. |
| `AZURE_OPENAI_ENDPOINT` | **Server-only** | Azure OpenAI endpoint URL (e.g., `https://your-resource.openai.azure.com`). |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | **Server-only** | Azure OpenAI deployment name for embeddings (e.g., `text-embedding-3-small`). |
| `GROQ_API_KEY` | **Server-only** | Groq API key for primary LLM. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Server-only** | Google Gemini API key for fallback LLM. |

### Optional Environment Variables (E2E Testing Only)

| Variable | Scope | Description |
|----------|-------|-------------|
| `TEST_USER_EMAIL` | **CI-only** | Email for E2E test user (e.g., `test@studium.local`). |
| `TEST_USER_PASSWORD` | **CI-only** | Password for E2E test user. |
| `E2E_TESTING` | **CI-only** | Set to `'true'` to enable `/api/auth/test-login` route. NEVER set in production. |
| `MOCK_EXTERNAL_APIS` | **CI-only** | Set to `'1'` to enable server-side mocking of Azure/Groq/Gemini in E2E tests. |

**Security Warning**: `E2E_TESTING=true` enables the test-login route which bypasses Google OAuth. This MUST NEVER be set in production deployments.

### `.env.local.example` Contents

```bash
# Supabase (get from Supabase dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key  # NEVER commit this!

# Azure OpenAI (get from Azure Portal → your OpenAI resource → Keys and Endpoint)
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# Groq (get from https://console.groq.com/keys)
GROQ_API_KEY=gsk_...your-groq-key

# Google Gemini (get from https://aistudio.google.com/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your-gemini-key
```

### Security Rules

1. **NEVER** commit `.env.local` to git (it's in `.gitignore` by default)
2. **NEVER** use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
3. **NEVER** prefix server-only keys with `NEXT_PUBLIC_`
4. **ALWAYS** verify env vars are loaded before using: `if (!process.env.GROQ_API_KEY) throw new Error('Missing GROQ_API_KEY')`

---

## Task Flow

```
[0. Project Setup + GitHub Student Pack Activation] 
       ↓
[1. Supabase Setup] → [2. Auth Implementation]
       ↓                       ↓
[3. File Upload] ←────────────┘
       ↓
[4. Embedding Pipeline (Azure OpenAI)]
       ↓
[5. AI Chat Service]
       ↓
[6. Chat UI]
       ↓
[7. Flashcard Generation]
       ↓
[8. Flashcard Review UI]
       ↓
[9. Polish & Testing]
       ↓
[10. Deployment (DigitalOcean + Custom Domain)]
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2 | Auth depends on Supabase setup |
| B | 3, 4 | File processing and embedding are sequential |
| C | 6, 8 | UI components can be built in parallel after backend |

| Task | Depends On | Reason |
|------|------------|--------|
| 2 | 1 | Auth needs Supabase configured |
| 3 | 2 | File upload needs auth context |
| 4 | 3 | Embeddings need uploaded files |
| 5 | 4 | Chat needs embedding search |
| 6 | 5 | Chat UI needs AI service |
| 7 | 5 | Flashcards use same AI service |
| 8 | 7 | Flashcard UI needs generation logic |
| 9 | 6, 8 | Polish after features complete |
| 10 | 9 | Deploy after testing |

---

## TODOs

- [ ] 0. Project Initialization + GitHub Student Pack Setup

  **What to do**:
  - **Activate GitHub Student Developer Pack benefits:**
    1. Go to https://education.github.com/pack
    2. Claim DigitalOcean $200 credit
    3. Claim Azure $100 credit
    4. Claim .TECH free domain (studium.tech)
    5. Activate GitHub Copilot Pro
  - Create Next.js 14 project with TypeScript and Tailwind
  - Initialize git repository
  - Set up project structure (app/, lib/, components/, types/)
  - Install core dependencies
  - Configure ESLint and Prettier
  - Set up Vitest for testing
  - Create initial README.md
  - Push to GitHub private repo
  - Set up Azure OpenAI resource for embeddings

  **Commands**:
  ```bash
  npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  pnpm add @supabase/ssr @supabase/supabase-js groq-sdk @google/genai openai unpdf mammoth react-markdown rehype-highlight
  pnpm add -D vitest @testing-library/react @vitejs/plugin-react jsdom
  npx shadcn@latest init
  git init && git add . && git commit -m "chore: initial project setup"
  ```

  **Azure OpenAI Setup**:
  1. Go to Azure Portal → Create Resource → Azure OpenAI
  2. Deploy `text-embedding-3-small` model (1536 dimensions)
  3. Note endpoint URL and API key
  4. Add to `.env.local`:
     ```
     AZURE_OPENAI_API_KEY=your_key
     AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
     AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
     ```

  **Must NOT do**:
  - Don't add unnecessary dependencies
  - Don't configure complex monorepo structure
  - Don't add analytics packages
  - Don't skip activating student benefits first!

  **Parallelizable**: NO (foundation for all other tasks)

  **References**:
  - GitHub Student Pack: https://education.github.com/pack
  - Azure OpenAI: https://learn.microsoft.com/en-us/azure/ai-services/openai/
  - Next.js 14 docs: https://nextjs.org/docs/getting-started/installation
  - shadcn/ui installation: https://ui.shadcn.com/docs/installation/next

  **Acceptance Criteria**:
  - [ ] GitHub Student Pack benefits activated (DigitalOcean, Azure, .TECH)
  - [ ] Azure OpenAI resource created with embedding model deployed
  - [ ] `pnpm dev` starts development server on localhost:3000
  - [ ] `pnpm build` completes without errors
  - [ ] `pnpm test` runs (even if no tests yet)
  - [ ] Project pushed to GitHub
  - [ ] Folder structure matches: `src/app/`, `src/lib/`, `src/components/`, `src/types/`

  **Commit**: YES
  - Message: `chore: initial project setup with Next.js 14, Tailwind, and testing infrastructure`
  - Files: All initial files
  - Pre-commit: `pnpm build`

---

- [ ] 1. Supabase Project Setup

  **What to do**:
  - Create Supabase project (manual step in dashboard)
  - Enable pgvector extension
  - Create database schema (users, classes, documents, messages, flashcards)
  - Set up Row Level Security (RLS) policies
  - Configure Supabase Storage bucket for documents
  - Create environment variables file
  - Set up Supabase client utilities (server + client)

  **Database Schema**:
  ```sql
  -- Enable extensions
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- Ensures gen_random_uuid() is available
  -- Note: Supabase runs PostgreSQL 15+ which has gen_random_uuid() built-in,
  -- but pgcrypto is a safe fallback for other PostgreSQL setups

  -- Classes table
  CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT classes_user_id_unique UNIQUE (user_id)  -- MVP: one class per user
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
    content TEXT NOT NULL,  -- Always populated during upload (extracted text)
    embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,  -- Stores error details when embedding_status = 'failed'
    processing_started_at TIMESTAMPTZ,  -- Set when embedding starts, used for optimistic locking
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()  -- Updated when embedding_status changes
  );

  -- Document chunks with embeddings (1536 dimensions for Azure OpenAI)
  CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT document_chunks_unique_index UNIQUE (document_id, chunk_index)  -- Ensures idempotent retry
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

  -- Vector similarity search function (returns document name for sources)
  CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
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
      AND documents.embedding_status = 'completed'  -- Only use fully processed documents
      AND document_chunks.embedding IS NOT NULL  -- Safety check for partial data
      AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    ORDER BY document_chunks.embedding <=> query_embedding
    LIMIT match_count;
  $$;

  -- RLS Policies (explicit per-operation policies with USING + WITH CHECK)
  ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

  -- CLASSES: Users can only access their own class (MVP: one class per user)
  CREATE POLICY "classes_select" ON classes FOR SELECT
    USING (auth.uid() = user_id);
  CREATE POLICY "classes_insert" ON classes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "classes_update" ON classes FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "classes_delete" ON classes FOR DELETE
    USING (auth.uid() = user_id);

  -- DOCUMENTS: Users can only access their own documents
  -- WITH CHECK also verifies class_id belongs to user (prevents cross-class foreign-key pollution)
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

  -- DOCUMENT_CHUNKS: Read-only for users (INSERT via service role only)
  CREATE POLICY "document_chunks_select" ON document_chunks FOR SELECT
    USING (document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()));
  -- NOTE: document_chunks INSERT/UPDATE/DELETE is done server-side via service role
  -- Service role bypasses RLS, so no INSERT/UPDATE/DELETE policies needed
  -- IMPORTANT: The embedding API route MUST use SUPABASE_SERVICE_ROLE_KEY
  -- Never expose service role key to client-side code

  -- MESSAGES: Users can only access their own messages
  -- WITH CHECK also verifies class_id belongs to user (prevents cross-class foreign-key pollution)
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

  -- FLASHCARDS: Users can only access their own flashcards
  -- WITH CHECK also verifies class_id belongs to user (prevents cross-class foreign-key pollution)
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
  ```

  **Supabase Storage Configuration**:
  - **Bucket Name**: `documents`
  - **Bucket Privacy**: **Private** (not publicly accessible)
  - **File Size Limit**: 10MB (configured in Supabase dashboard)
  - **Allowed MIME Types**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - **Object Path Convention**: `{user_id}/{document_id}/{original_filename}`
    - Example: `550e8400-e29b-41d4-a716-446655440000/doc_abc123/lecture-notes.pdf`
  - **Storage Policies** (create in Supabase dashboard → Storage → Policies):
    ```sql
    -- Allow authenticated users to upload to their own folder
    CREATE POLICY "Users can upload to own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

    -- Allow users to read their own files
    CREATE POLICY "Users can read own files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

    -- Allow users to delete their own files
    CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
    ```
  - **File Download Strategy**: Server-side signed URLs
    - Never expose storage URLs directly to client
    - API route generates short-lived signed URL (e.g., 60 seconds)
    - Client fetches via signed URL for preview/download

  **Service Role Usage Boundaries**:
  | Route | Client Type | Reason |
  |-------|-------------|--------|
  | `/api/upload` | **User SSR + Service role** | User client for auth + RLS on documents table; Service role for document_chunks DELETE + INSERT (embedding generation happens inline) |
  | `/api/documents/[id]/retry` | **User SSR + Service role** | User client for auth + RLS on documents table; Service role for document_chunks DELETE + INSERT (re-runs embedding generation) |
  | `/api/documents/[id]/status` | User SSR client | RLS ensures user can only read own documents |
  | `/api/chat` | User SSR client | RLS ensures user can only read own messages/chunks |
  | `/api/flashcards/*` | User SSR client | RLS ensures user can only manage own flashcards |
  
  **CRITICAL**: When using service role in `/api/upload`, the route MUST:
  1. First authenticate the user via user SSR client (`getUser()`)
  2. Use user client for all document table operations (protected by RLS)
  3. Use service role ONLY for document_chunks DELETE + INSERT operations (DELETE for idempotent retry, INSERT for new chunks)
  4. Never expose service role key to client-side code

  **Canonical Supabase Helpers** (authoritative implementation):
  
  The project uses two Supabase client helpers. Both are async because `@supabase/ssr` requires access to cookies.
  
  **CRITICAL: Session Refresh Strategy**
  - Session refresh is handled EXCLUSIVELY by middleware (`src/middleware.ts`)
  - Middleware runs on every request and writes refreshed tokens to cookies
  - Server Components ONLY READ cookies (never write) - this is safe in Next.js
  - Route Handlers CAN write cookies (they run in request context)
  - This architecture prevents the "cookies().set() not allowed in Server Components" error
  
  ```typescript
  // src/lib/supabase/middleware.ts (ONLY used by root middleware.ts)
  import { createServerClient } from '@supabase/ssr';
  import { NextResponse, type NextRequest } from 'next/server';

  export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session - this may update cookies
    const { data: { user } } = await supabase.auth.getUser();

    // Define public routes that don't require authentication
    const pathname = request.nextUrl.pathname;
    const isPublicRoute = pathname === '/' ||                    // Landing page
                          pathname === '/login' || 
                          pathname.startsWith('/auth/') ||       // OAuth callbacks
                          pathname.startsWith('/api/');          // API routes handle their own auth
    
    // Redirect unauthenticated users to login (except public routes)
    // Note: API routes are excluded from redirect - they return JSON errors instead
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return supabaseResponse;
  }
  ```

  ```typescript
  // src/middleware.ts (root middleware)
  import { updateSession } from '@/lib/supabase/middleware';
  import type { NextRequest } from 'next/server';

  export async function middleware(request: NextRequest) {
    return await updateSession(request);
  }

  export const config = {
    matcher: [
      // Match all routes except static files and API routes that don't need auth
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  };
  ```
  
  ```typescript
  // src/lib/supabase/server.ts (for Server Components and Route Handlers)
  // NOTE: Server Components should ONLY read session, never write cookies.
  // Cookie writes happen in middleware (session refresh) and Route Handlers.
  import { createServerClient } from '@supabase/ssr';
  import { cookies } from 'next/headers';
  
  export async function createClient() {
    const cookieStore = await cookies();
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // In Server Components, this is a no-op (cookies are read-only)
            // In Route Handlers, this will work normally
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Expected to fail in Server Components - middleware handles refresh
            }
          },
        },
      }
    );
  }
  ```
  
  ```typescript
  // src/lib/supabase/client.ts (for Client Components)
  import { createBrowserClient } from '@supabase/ssr';
  
  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  ```
  
  **Usage Patterns**:
  | Context | Import | Call Pattern |
  |---------|--------|--------------|
  | Server Component | `import { createClient } from '@/lib/supabase/server'` | `const supabase = await createClient();` |
  | Route Handler | `import { createClient } from '@/lib/supabase/server'` | `const supabase = await createClient();` |
  | Client Component | `import { createClient } from '@/lib/supabase/client'` | `const supabase = createClient();` (no await) |
  
  **IMPORTANT**: The server helper is async and MUST be awaited. The client helper is sync.

  **Must NOT do**:
  - Don't expose service role key to client
  - Don't skip RLS policies
  - Don't use deprecated auth helpers

  **Parallelizable**: NO (foundation for auth)

  **References**:
  - Supabase pgvector guide: https://supabase.com/docs/guides/ai/vector-columns
  - Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
  - @supabase/ssr setup: https://supabase.com/docs/guides/auth/server-side/nextjs

  **Acceptance Criteria**:
  - [ ] Supabase project created with URL and keys
  - [ ] `.env.local` contains all required keys
  - [ ] All tables created in Supabase dashboard
  - [ ] RLS policies active (verify in dashboard)
  - [ ] Storage bucket "documents" created with 10MB limit
  - [ ] `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` created
  - [ ] Test query works: `SELECT * FROM classes;` returns empty array (not error)

  **Commit**: YES
  - Message: `feat(db): add Supabase schema with pgvector and RLS policies`
  - Files: `src/lib/supabase/*`, `.env.local.example`, `supabase/schema.sql`
  - Pre-commit: `pnpm build`

---

- [ ] 2. Authentication Implementation

  **What to do**:
  - Configure Google OAuth in Supabase dashboard
  - Create auth callback route handler
  - Create middleware for session refresh
  - Build login page with Google sign-in button
  - Build auth context provider
  - Create protected route wrapper
  - Add sign-out functionality
  - Write auth flow tests

  **Must NOT do**:
  - Don't use `getSession()` in Server Components
  - Don't implement custom JWT handling
  - Don't add email/password auth for production users (Google only for MVP)
    - **Exception**: A `/api/auth/test-login` route exists for E2E testing only, blocked in production
  - Don't skip middleware setup

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  - Supabase OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google
  - Next.js middleware pattern: https://supabase.com/docs/guides/auth/server-side/nextjs

  **File Structure**:
  ```
  src/
    app/
      auth/
        callback/route.ts    # OAuth callback handler
      api/
        auth/
          test-login/route.ts  # E2E test auth (blocked in production)
      login/page.tsx         # Login page
    components/
      auth/
        login-button.tsx     # Google sign-in button
        user-nav.tsx         # User dropdown with sign-out
    lib/
      supabase/
        middleware.ts        # Session refresh logic
    middleware.ts            # Root middleware
  ```

  **Acceptance Criteria**:
  - [ ] Google OAuth configured in Supabase (manual verification)
  - [ ] Clicking "Sign in with Google" redirects to Google
  - [ ] After Google auth, user redirected to `/dashboard`
  - [ ] User session persists across page refreshes
  - [ ] Sign out clears session and redirects to `/login`
  - [ ] Accessing `/dashboard` without auth redirects to `/login`
  - [ ] `pnpm test` passes auth flow tests

  **Manual Verification**:
  - [ ] Open `http://localhost:3000/login`
  - [ ] Click "Sign in with Google"
  - [ ] Complete Google OAuth flow
  - [ ] Verify redirect to `/dashboard`
  - [ ] Refresh page - still logged in
  - [ ] Click sign out - redirected to `/login`

  **Commit**: YES
  - Message: `feat(auth): implement Google OAuth with Supabase`
  - Files: `src/app/auth/*`, `src/app/login/*`, `src/components/auth/*`, `src/middleware.ts`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 3. File Upload System

  **What to do**:
  - Create file upload API route with validation
  - Implement client-side file picker with drag-and-drop
  - Add file type validation (PDF, DOCX only)
  - Add file size validation (max 10MB)
  - Extract text from PDF using unpdf
  - Extract text from DOCX using mammoth
  - Store file in Supabase Storage
  - Save document metadata to database
  - Create document list UI with rename/label feature
  - Add upload progress indicator
  - Write file processing tests

  **Must NOT do**:
  - Don't process files client-side (security)
  - Don't allow files > 10MB
  - Don't support image-only PDFs (no OCR)
  - Don't allow file deletion within session

  **File Processing Edge Cases**:
  - **Scanned/Image PDFs (no extractable text)**:
    - Detection: If extracted text length < 50 characters after trimming whitespace
    - Error message: "Could not extract text from this PDF. It may be a scanned document. Please upload a text-based PDF."
    - Do NOT save document to database if extraction fails
  - **Very Long Documents**:
    - Threshold: 90,000 characters (~22,500 words)
    - Action: Truncate at 90,000 characters
    - Rationale: With 2000-char chunks and 200-char overlap, this yields ≤50 chunks (safe for embedding timeout)
    - Warning toast: "Document was truncated to the first ~22,500 words due to size limits."
    - Save truncated text (user can still chat about partial content)
  - **Empty DOCX Files**:
    - Detection: Extracted text length < 10 characters
    - Error message: "This document appears to be empty or contains only images."
  - **Corrupted Files**:
    - Detection: unpdf/mammoth throws an error during extraction
    - Error message: "Could not read this file. It may be corrupted or password-protected."
    - Log error details server-side for debugging

  **Upload Pipeline Sequence** (authoritative order of operations):
  ```
  CLIENT                           SERVER (/api/upload)
  ──────                           ─────────────────────
  1. Select file (drag-drop/click)
  2. Validate: type (PDF/DOCX)
  3. Validate: size (≤10MB)
  4. POST /api/upload (FormData)  ──→  5. Auth check via User SSR client (getUser)
                                       6. Validate file server-side
                                       7. Extract text (unpdf/mammoth)
                                       8. If extraction fails → return error, STOP
                                       9. Generate document UUID upfront: 
                                          const documentId = crypto.randomUUID();
                                       10. Compute file_path upfront:
                                           const filePath = `${user.id}/${documentId}/${filename}`;
                                       11. Upload file to Storage via User client FIRST:
                                           path: {user_id}/{document_id}/{filename}
                                       12. If Storage upload fails → return error, STOP
                                        13. INSERT document row via User client with all NOT NULL fields:
                                            {
                                              id: documentId,           // UUID generated in step 9
                                              class_id: classId,        // From request body
                                              user_id: user.id,         // From authenticated user
                                              filename: file.name,      // Original filename
                                              file_path: filePath,      // Storage path from step 10
                                              file_size: file.size,     // File size in bytes
                                              content: extractedText,   // Extracted text from step 7
                                              embedding_status: 'pending'
                                            }
                                            RLS allows INSERT because user_id = auth.uid()
                                        14. Generate embeddings INLINE (same request):
                                            - Call generateDocumentEmbeddings(supabase, documentId, extractedText)
                                            - NOTE: Status transitions (pending→processing→completed/failed) happen 
                                              INSIDE generateDocumentEmbeddings with optimistic locking
                                            - Chunk text, generate embeddings via Azure OpenAI
                                            - INSERT document_chunks via **Service role** (bypasses RLS)
                                   ←──  15. Return response: { document_id, embedding_status }
  16. Show result in UI ('completed' shows success, 'failed' shows error with retry option)
  ```
  
  Note: The client receives either 'completed' or 'failed' in the response. If the request times out before receiving a response, see "Timeout Recovery" section below.
  
  **Key Ordering Constraint**: Storage upload MUST succeed before document INSERT to avoid orphan DB rows. The `file_path` and `content` are both computed before INSERT, satisfying the NOT NULL constraints.
  
  **Architecture Decision**: Embedding generation is performed inline within `/api/upload` rather than as a separate API endpoint. This simplifies the architecture:
  - No need for separate `/api/embeddings/generate` route
  - Ownership is already verified when document is created
  - Service role is used ONLY for `document_chunks` DELETE + INSERT (DELETE for idempotent retry, INSERT for new chunks)
  - All document table operations use user client (protected by RLS)

  **Upload API Contract**:
  - **Request**: `POST /api/upload`
    - Content-Type: `multipart/form-data`
    - Body: `{ file: File, class_id: string }`
  - **Response (success)**: `{ document_id: string, embedding_status: 'completed' | 'failed', error_message?: string }`
    - Note: Response is returned AFTER embedding completes (blocking). Status is typically 'completed' or 'failed', never 'processing'.
  - **Response (error)**: `{ error: string }` with appropriate HTTP status

  **Retry API Contract** (same shape as upload for consistency):
  - **Request**: `POST /api/documents/[id]/retry`
  - **Precondition**: Document must be `embedding_status='failed'` OR stuck in `'processing'` for >20 minutes
  - **Response (success)**: `{ document_id: string, embedding_status: 'completed' | 'failed', error_message?: string }`
  - **Response (error)**: `{ error: string }` with appropriate HTTP status

  **Status API Contract** (extended shape for polling):
  - **Request**: `GET /api/documents/[id]/status`
  - **Response**: `{ embedding_status: 'pending' | 'processing' | 'completed' | 'failed', error_message?: string, updated_at: string, chunk_count?: number }`
    - Note: This endpoint includes all statuses since it's used for polling during timeout recovery.

  **Timeout Recovery** (edge case when client doesn't receive `document_id`):
  If the `/api/upload` request times out before returning a response, the client won't have the `document_id` to poll.
  
  **Important**: This is the ONLY scenario where client might see `embedding_status='pending'` or `'processing'`. The normal upload response (above) always returns `'completed'` or `'failed'` because embedding runs inline.
  
  **Recovery strategy**:
  1. Client shows "Upload may have partially completed. Refreshing..."
  2. Client refreshes the document list by querying Supabase directly (RLS enforces ownership):
     ```typescript
     const { data: docs } = await supabase
       .from('documents')
       .select('id, filename, embedding_status')
       .eq('class_id', classId)
       .order('created_at', { ascending: false });
     ```
  3. Any document with `embedding_status='pending'` or `embedding_status='processing'` should be polled via `/api/documents/[id]/status`
  4. Client polls each incomplete document every 2s until all are `completed` or `failed`
  This approach works because the document INSERT happens before embedding generation, so incomplete documents are visible in the list.

  **Failure Compensation**:
  - If Storage upload succeeds but DB update fails → Delete Storage object
  - If embedding generation fails → Document stays in DB with `embedding_status='failed'`, user can retry
  - If entire request fails after document INSERT → Document may exist with `embedding_status='pending'` (orphan cleanup TBD in Phase 2)

  **Parallelizable**: NO (depends on Task 2)

  **References**:
  - unpdf usage: https://github.com/nicolo-ribaudo/unpdf
  - mammoth.js: https://github.com/mwilliamson/mammoth.js
  - Supabase Storage: https://supabase.com/docs/guides/storage

  **File Structure**:
  ```
  src/
    app/
      api/
        upload/route.ts      # File upload handler
    components/
      documents/
        file-upload.tsx      # Drag-and-drop uploader
        document-list.tsx    # List of uploaded docs
        document-item.tsx    # Single doc with rename
    lib/
      file-processing/
        pdf.ts               # PDF text extraction
        docx.ts              # DOCX text extraction
        index.ts             # Unified processor
  ```

  **Acceptance Criteria**:
  - [ ] Drag-and-drop file upload works
  - [ ] Click-to-select file upload works
  - [ ] PDF files extract text correctly
  - [ ] DOCX files extract text correctly
  - [ ] Files > 10MB show error message
  - [ ] Non-PDF/DOCX files show error message
  - [ ] Upload progress indicator shows during upload
  - [ ] Uploaded documents appear in list
  - [ ] Documents can be renamed/labeled
  - [ ] File stored in Supabase Storage
  - [ ] Document metadata saved to database

  **Manual Verification**:
  - [ ] Upload a 5-page PDF lecture notes
  - [ ] Verify text appears in document preview
  - [ ] Upload a DOCX file
  - [ ] Verify text extracted
  - [ ] Try uploading a 15MB file - see error
  - [ ] Try uploading a .txt file - see error
  - [ ] Rename a document - verify label updates

  **Commit**: YES
  - Message: `feat(upload): implement PDF/DOCX upload with text extraction`
  - Files: `src/app/api/upload/*`, `src/components/documents/*`, `src/lib/file-processing/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 4. Embedding Pipeline (Azure OpenAI)

  **What to do**:
  - Create embedding service using Azure OpenAI
  - Implement text chunking (2000 characters with 200 character overlap)
  - Generate embeddings using text-embedding-3-small (1536 dimensions)
  - Store embeddings in document_chunks table
  - Create embedding generation trigger after file upload
  - Implement similarity search function
  - Add embedding status indicator in UI (pending → processing → completed)
  - Write embedding pipeline tests

  **Embedding Pipeline Execution Model**:
  - **Execution**: Synchronous (blocking) - embeddings generated inline within `/api/upload` after file processing completes
  - **Status Flow**: `pending` → `processing` → `completed` | `failed`
  - **Expected Response Time**: 5-30 seconds depending on document size
  - **Timeout Constraints**:
    - DigitalOcean App Platform: Default 60s timeout for HTTP requests (sufficient for most docs)
    - Max chunks to prevent timeout: 50 chunks (~100KB text) - larger docs truncated in extraction phase
    - If embedding takes >45s, consider the document too large and fail gracefully
  - **Client UX During Upload**:
    - Client shows "Uploading and processing..." spinner during the entire request
    - On success: Toast "Document ready!" with checkmark
    - On failure: Toast "Processing failed" with retry button
  - **Polling (Edge Case Only)**: The status endpoint exists primarily for:
    - Retry route: Resuming after a timeout mid-embedding
    - Future async mode: If we move to background processing later
    - Typical flow does NOT require polling since response is synchronous
  - **Retry Policy**: 3 attempts with exponential backoff (1s, 2s, 4s delays) for Azure API calls
  - **Failure Handling**: 
    - Show toast error: "Failed to process document. Please try again."
    - Display "Retry" button that calls `POST /api/documents/[id]/retry` (re-runs embedding generation for failed documents)
    - After 3 consecutive failures, show: "Unable to process this document. It may be corrupted or unsupported."
  - **Service Role Requirement**: Embedding generation code uses service role ONLY for `document_chunks` DELETE + INSERT (DELETE for idempotent retry, INSERT for new chunks; all document table operations use user client with RLS)

  **Embedding Generation Code** (called inline from `/api/upload`):
  ```typescript
  // src/lib/embeddings/generate.ts
  import { createClient as createServiceClient } from '@supabase/supabase-js';
  import { SupabaseClient } from '@supabase/supabase-js';
  import { chunkText } from './chunker';
  import { generateEmbedding } from './azure-openai';
  
  /**
   * Retry helper with exponential backoff (1s, 2s, 4s delays)
   */
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
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
  
  /**
   * Generate embeddings for a document. Called from /api/upload after document creation.
   * Uses optimistic locking to prevent concurrent runs from corrupting data.
   * @param userSupabase - User SSR client (for document table operations with RLS)
   * @param documentId - The document ID
   * @param content - The extracted text content
   */
  export async function generateDocumentEmbeddings(
    userSupabase: SupabaseClient,
    documentId: string,
    content: string
  ): Promise<{ embedding_status: 'completed' | 'failed'; error_message?: string }> {
    // Service client for document_chunks DELETE + INSERT only
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const processingTimestamp = new Date().toISOString();
    const STUCK_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes - MUST match retry route threshold
    
    // OPTIMISTIC LOCK: Atomically claim the document for processing
    // Only update if status is 'pending' OR 'failed' OR stuck 'processing' (>20 min old)
    // This prevents concurrent embedding runs from corrupting data
    const { data: claimed, error: claimError } = await userSupabase
      .from('documents')
      .update({ 
        embedding_status: 'processing', 
        processing_started_at: processingTimestamp,
        updated_at: processingTimestamp 
      })
      .eq('id', documentId)
      .or(`embedding_status.eq.pending,embedding_status.eq.failed,and(embedding_status.eq.processing,processing_started_at.lt.${new Date(Date.now() - STUCK_THRESHOLD_MS).toISOString()})`)
      .select()
      .single();
    
    if (claimError || !claimed) {
      // Another process is already working on this document
      return { embedding_status: 'failed', error_message: 'Document is already being processed' };
    }
    
    try {
      // Delete existing chunks first (idempotent retry)
      // This ensures retry doesn't create duplicates even if unique constraint exists as safety net
      await serviceSupabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId)
        .throwOnError();
      
      // Chunk text and generate embeddings
      const chunks = chunkText(content);
      for (const [index, chunk] of chunks.entries()) {
        // Use retry with exponential backoff (1s, 2s, 4s) for Azure API calls
        const embedding = await withRetry(() => generateEmbedding(chunk), 3, 1000);
        // INSERT via service role (no RLS INSERT/DELETE policy on document_chunks)
        await serviceSupabase.from('document_chunks').insert({
          document_id: documentId,
          content: chunk,
          embedding,
          chunk_index: index,
        }).throwOnError();
      }
      
      // Update status to completed via user client
      await userSupabase
        .from('documents')
        .update({ embedding_status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .throwOnError();
        
      return { embedding_status: 'completed' };
    } catch (error) {
      // Update status to failed via user client
      // Wrap in try/catch to ensure original error is preserved even if status update fails
      const originalError = error instanceof Error ? error.message : 'Unknown error';
      try {
        await userSupabase
          .from('documents')
          .update({ 
            embedding_status: 'failed', 
            error_message: originalError,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)
          .throwOnError();
      } catch (statusUpdateError) {
        // Log but don't mask the original error
        console.error('Failed to update document status to failed:', statusUpdateError);
      }
        
      return { embedding_status: 'failed', error_message: originalError };
    }
  }
  ```

  **Chunking Strategy** (character-based for predictability):
  - Chunk size: 2000 characters
  - Overlap: 200 characters
  - This guarantees: 90,000 chars / 1,800 effective chars per chunk = 50 chunks max
  - Token equivalent: ~500 tokens/chunk (using 1 token ≈ 4 chars heuristic)
  - Note: Using character-based chunking ensures deterministic chunk counts regardless of text content

  **Must NOT do**:
  - Don't skip chunking (context limits)
  - Don't store embeddings client-side
  - Don't exceed rate limits (batch requests)

  **Parallelizable**: NO (depends on Task 3)

  **References**:
  - Azure OpenAI embeddings: https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings
  - Text chunking strategies: https://www.pinecone.io/learn/chunking-strategies/

  **File Structure**:
  ```
  src/
    app/
      api/
        documents/
          [id]/
            status/route.ts  # Document status endpoint
            retry/route.ts   # Retry embedding generation for failed documents
    lib/
      embeddings/
        chunker.ts           # Text chunking logic
        azure-openai.ts      # Azure OpenAI client
        generate.ts          # Embedding generation function (called from /api/upload)
        search.ts            # Similarity search
  ```

  **Retry Route** (for failed or stuck documents):
  ```typescript
  // src/app/api/documents/[id]/retry/route.ts
  import { createClient } from '@/lib/supabase/server';
  import { generateDocumentEmbeddings } from '@/lib/embeddings/generate';
  import { NextResponse } from 'next/server';
  
  // Documents stuck in 'processing' for longer than this are considered stuck and retriable
  // Worst-case: 50 chunks × 3 retries × 7s backoff = ~17.5 min, so use 20 min for safety margin
  // IMPORTANT: This threshold MUST match the optimistic lock threshold in generateDocumentEmbeddings
  const STUCK_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes
  
  export async function POST(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // RLS ensures user can only fetch their own documents
    const { data: doc, error } = await supabase
      .from('documents')
      .select('id, content, embedding_status, processing_started_at')
      .eq('id', params.id)
      .single();
    
    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Guard: content should always exist (NOT NULL in schema), but defend anyway
    if (!doc.content) {
      return NextResponse.json({ error: 'Document has no content to process' }, { status: 400 });
    }
    
    // Allow retry for failed documents OR documents stuck in 'processing' for too long
    // Use processing_started_at (not updated_at) for consistency with optimistic lock
    const isStuckProcessing = doc.embedding_status === 'processing' && 
      doc.processing_started_at &&
      (Date.now() - new Date(doc.processing_started_at).getTime() > STUCK_THRESHOLD_MS);
    
    if (doc.embedding_status !== 'failed' && !isStuckProcessing) {
      return NextResponse.json({ 
        error: 'Can only retry failed documents or documents stuck in processing for >20 minutes' 
      }, { status: 400 });
    }
    
    // Re-run embedding generation (uses optimistic locking internally to prevent concurrent runs)
    // Returns { embedding_status, error_message? } - same shape as /api/upload response
    const result = await generateDocumentEmbeddings(supabase, doc.id, doc.content);
    return NextResponse.json({ document_id: doc.id, ...result });
  }
  ```

  **Document Status API Route**:
  - **Path**: `GET /api/documents/[id]/status`
  - **Handler**: `src/app/api/documents/[id]/status/route.ts`
  - **Auth**: Uses user SSR client (RLS enforces ownership)
  - **Response Shape**:
    ```typescript
    interface DocumentStatusResponse {
      embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
      error_message?: string;  // Only present if status === 'failed'
      updated_at: string;      // ISO timestamp of last status change
      chunk_count?: number;    // Only present if status === 'completed'
    }
    ```
  - **Implementation**:
    ```typescript
    // src/app/api/documents/[id]/status/route.ts
    import { createClient } from '@/lib/supabase/server';
    import { NextResponse } from 'next/server';
    
    export async function GET(
      request: Request,
      { params }: { params: { id: string } }
    ) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      // RLS ensures user can only fetch their own documents
      const { data: doc, error } = await supabase
        .from('documents')
        .select('embedding_status, error_message, updated_at')
        .eq('id', params.id)
        .single();
      
      if (error || !doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      
      // Get chunk count if completed
      let chunk_count: number | undefined;
      if (doc.embedding_status === 'completed') {
        const { count } = await supabase
          .from('document_chunks')
          .select('*', { count: 'exact', head: true })
          .eq('document_id', params.id);
        chunk_count = count ?? undefined;
      }
      
      return NextResponse.json({
        embedding_status: doc.embedding_status,
        error_message: doc.error_message,  // Include error details for failed status
        updated_at: doc.updated_at,
        chunk_count,
      });
    }
    ```

  **Azure OpenAI Embedding Code**:
  ```typescript
  // src/lib/embeddings/azure-openai.ts
  import { AzureOpenAI } from 'openai';

  const client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: '2024-02-01',
  });

  export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await client.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: text,
    });
    return response.data[0].embedding;
  }
  ```

  **Acceptance Criteria**:
  - [ ] Text chunked into 2000-character segments with 200-char overlap
  - [ ] Embeddings generated via Azure OpenAI
  - [ ] Embeddings stored in document_chunks table (1536 dimensions)
  - [ ] Similarity search returns relevant chunks
  - [ ] UI shows "Processing..." during embedding
  - [ ] UI shows "Ready" when embeddings complete
  - [ ] Search for "what is recursion" returns relevant chunks from uploaded CS notes

  **Manual Verification**:
  - [ ] Upload a document about recursion
  - [ ] Wait for "Ready" status
  - [ ] In Supabase dashboard, verify document_chunks has entries
  - [ ] Run test query: `SELECT * FROM match_document_chunks(...)` returns results

  **Commit**: YES
  - Message: `feat(rag): implement embedding pipeline with Azure OpenAI`
  - Files: `src/lib/embeddings/*`, `src/app/api/documents/[id]/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 5. AI Chat Service

  **What to do**:
  - Create AI service class with Groq as primary provider
  - Implement Gemini as fallback provider
  - Add rate limit detection and retry timer
  - Create RAG prompt template with context injection
  - Implement chat completion API route
  - Add conversation history management
  - Create study-focused system prompts
  - Write AI service tests with mocked responses

  **Must NOT do**:
  - Don't expose API keys to client
  - Don't implement streaming (Phase 2)
  - Don't skip rate limit handling
  - Don't hardcode prompts (use constants)

  **Parallelizable**: NO (depends on Task 4)

  **References**:
  - Groq SDK: https://console.groq.com/docs/quickstart
  - Google Gemini: https://ai.google.dev/tutorials/node_quickstart
  - RAG prompt patterns: https://www.pinecone.io/learn/rag-prompts/

  **File Structure**:
  ```
  src/
    app/
      api/
        chat/route.ts        # Chat completion endpoint
    lib/
      ai/
        providers/
          groq.ts            # Groq implementation
          gemini.ts          # Gemini implementation
        service.ts           # Main AI service with fallback
        prompts.ts           # System prompts
        types.ts             # AI-related types
  ```

  **Chat API Contract**:
  - **Path**: `POST /api/chat`
  - **Request Schema**:
    ```typescript
    interface ChatRequest {
      class_id: string;       // UUID of the class
      message: string;        // User's message (1-5000 characters)
    }
    ```
  - **Response Schema (success)**:
    ```typescript
    interface ChatResponse {
      message_id: string;     // UUID of the saved assistant message
      content: string;        // AI response with markdown
      sources: {              // Document chunks used as context
        document_id: string;
        document_name: string;
        chunk_preview: string; // First 100 characters of chunk
      }[];
    }
    ```
  - **Response Schema (rate limited)**:
    ```typescript
    interface RateLimitResponse {
      error: 'rate_limited';
      retry_after: number;    // Seconds until retry allowed
      provider: 'groq' | 'gemini' | 'both';
    }
    ```
  - **Response Schema (error)**:
    ```typescript
    interface ErrorResponse {
      error: string;          // Error message
    }
    ```

  **RAG Retrieval Algorithm**:
  1. **Generate Query Embedding**: Convert user message to embedding via Azure OpenAI
  2. **Similarity Search**: Call `match_document_chunks(query_embedding, threshold, count, class_id)`
     - `threshold`: 0.7 (minimum similarity score)
     - `count`: 5 (maximum chunks to retrieve)
     - `class_id`: From request (ensures only user's documents are searched, enforced by RLS)
  3. **Handle Zero Results**: If no chunks match (0 results):
     - Include a fallback context: "No relevant documents found. Answer based on general knowledge, but inform the user that the answer is not from their uploaded materials."
  4. **Build Context**: Concatenate retrieved chunks, max 4000 characters total
     - Order: By similarity score (highest first)
     - Truncation: If total > 4000 chars, include as many full chunks as fit
  5. **Include Chat History**: Fetch last 10 messages from `messages` table for this class
     - Order: By `created_at` ascending (oldest first)
     - Include both user and assistant messages

  **Chat Flow Implementation**:
  
  > **NOTE**: The following is **illustrative pseudocode** showing the logical flow. 
  > The actual implementation must include proper imports, complete error handling with `.throwOnError()`, 
  > and implementations of helper functions (`buildContext`, `aiService`, etc.) as defined elsewhere in this plan.
  
  ```typescript
  // src/app/api/chat/route.ts (ILLUSTRATIVE PSEUDOCODE - do not copy directly)
  import { createClient } from '@/lib/supabase/server';
  import { NextResponse } from 'next/server';
  
  export async function POST(request: Request) {
    const supabase = await createClient();  // MUST await (server helper is async)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();
    
    const { class_id, message } = await request.json();
    
    // Validate message length
    if (!message || message.length > 5000) {
      return NextResponse.json({ error: 'Message must be 1-5000 characters' }, { status: 400 });
    }
    
    // Verify class ownership (RLS enforces this)
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .single();
    if (!classData) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    
    // Fetch chat history BEFORE inserting user message (excludes current message)
    // Use subquery pattern: fetch last 10 by created_at DESC, then reverse for chronological order
    const { data: historyRaw } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('class_id', class_id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Reverse to get chronological order (oldest first for LLM context)
    // Note: history does NOT include the current user message - it's passed separately
    const history = historyRaw?.reverse() ?? [];
    
    // Save user message (AFTER fetching history to avoid including it twice)
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ class_id, user_id: user.id, role: 'user', content: message })
      .select('id')
      .single();
    
    // Retrieve context chunks
    const queryEmbedding = await generateEmbedding(message);
    const { data: chunks } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
      filter_class_id: class_id,
    });
    
    // Build context string
    const context = buildContext(chunks); // max 4000 chars
    
    // Call AI service (Groq → Gemini fallback)
    // history = previous messages (fetched earlier), message = current user input
    const aiResponse = await aiService.chat({ context, history, message });
    
    if (aiResponse.rateLimited) {
      return NextResponse.json({
        error: 'rate_limited',
        retry_after: aiResponse.retryAfter,
        provider: aiResponse.provider,
      }, { status: 429 });
    }
    
    // Save assistant message
    const { data: assistantMsg } = await supabase
      .from('messages')
      .insert({ class_id, user_id: user.id, role: 'assistant', content: aiResponse.content })
      .select('id')
      .single();
    
    return NextResponse.json({
      message_id: assistantMsg.id,
      content: aiResponse.content,
      sources: chunks?.map(c => ({
        document_id: c.document_id,
        document_name: c.document_name, // Now returned directly from match_document_chunks RPC
        chunk_preview: c.content.substring(0, 100),
      })) || [],
    });
  }
  ```

  **Page Load: Fetching Chat History**:
  - On `/class/[id]` page load, fetch existing messages:
    ```typescript
    const { data: messages } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('class_id', classId)
      .order('created_at', { ascending: true });
    ```
  - Display all messages in the chat UI
  - User can continue conversation from where they left off

  **System Prompt**:
  ```
  You are Studium, an AI study assistant. You help students understand their course materials.

  CONTEXT FROM UPLOADED DOCUMENTS:
  {context}

  INSTRUCTIONS:
  - Answer questions based on the provided context
  - If the answer isn't in the context, say so clearly
  - Use clear, educational explanations
  - Format responses with markdown for readability
  - Include relevant examples when helpful
  - For code topics, include code snippets with syntax highlighting
  ```

  **Rate Limit Detection & Handling**:
  - **Groq Detection**:
    - HTTP 429 status code
    - Error response with `error.code === 'rate_limit_exceeded'`
    - Error message containing "rate limit" (case-insensitive fallback)
  - **Gemini Detection**:
    - HTTP 429 status code
    - Error response with `error.status === 'RESOURCE_EXHAUSTED'`
    - Error message containing "quota" or "rate" (case-insensitive fallback)
  - **Retry-After Extraction**:
    - Check `Retry-After` header (seconds until retry allowed)
    - If header missing, default to 60 seconds
    - Store retry timestamp in memory for each provider
  - **Fallback Flow**:
    1. Try Groq → if rate limited, store retry time, try Gemini
    2. Try Gemini → if rate limited, store retry time, show UI timer
    3. If both rate limited, show: "Both AI providers are busy. Please try again in {X} seconds."
  - **UI Timer**: Display countdown showing seconds until next attempt allowed
  - **Testing Strategy**:
    - Vitest mocks for 429 responses from both providers
    - Test fallback logic triggers correctly
    - Test retry timer displays correctly

  **Acceptance Criteria**:
  - [ ] Chat endpoint accepts messages and returns AI response
  - [ ] Context from relevant document chunks injected into prompt
  - [ ] Groq used as primary provider
  - [ ] When Groq rate limited, Gemini fallback activates
  - [ ] When both rate limited, friendly retry timer shown
  - [ ] Conversation history persisted to database
  - [ ] Previous messages included in context (last 10)
  - [ ] Response includes markdown formatting

  **Manual Verification**:
  - [ ] Send chat message about uploaded document
  - [ ] Verify response references document content
  - [ ] Refresh page - chat history preserved
  - [ ] Simulate rate limit (if possible) - see fallback message

  **Commit**: YES
  - Message: `feat(ai): implement chat service with Groq/Gemini fallback`
  - Files: `src/app/api/chat/*`, `src/lib/ai/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 6. Chat Interface UI

  **What to do**:
  - Create chat message component with markdown rendering
  - Add code syntax highlighting with rehype-highlight
  - Implement copy-to-clipboard for responses
  - Build chat input with send button
  - Add loading state with thinking indicator
  - Create chat container with auto-scroll
  - Build error display with retry button
  - Implement rate limit countdown timer
  - Make chat mobile-responsive
  - Add keyboard shortcuts (Enter to send)

  **Must NOT do**:
  - Don't implement voice input
  - Don't add message reactions/ratings
  - Don't build complex message threading

  **Parallelizable**: YES (can build components while Task 5 in progress)

  **References**:
  - react-markdown: https://github.com/remarkjs/react-markdown
  - rehype-highlight: https://github.com/rehypejs/rehype-highlight
  - shadcn/ui components: https://ui.shadcn.com/docs/components/button

  **File Structure**:
  ```
  src/
    app/
      class/
        [id]/
          page.tsx           # Main class page with chat
    components/
      chat/
        chat-container.tsx   # Main chat wrapper
        message.tsx          # Single message bubble
        message-content.tsx  # Markdown renderer
        chat-input.tsx       # Input field
        copy-button.tsx      # Copy to clipboard
        loading-indicator.tsx
        rate-limit-timer.tsx
  ```

  **Acceptance Criteria**:
  - [ ] Messages display with proper formatting
  - [ ] Code blocks have syntax highlighting
  - [ ] Copy button copies message content to clipboard
  - [ ] Loading indicator shows while waiting for AI
  - [ ] Chat auto-scrolls to newest message
  - [ ] Enter key sends message
  - [ ] Shift+Enter creates new line
  - [ ] Rate limit shows countdown timer
  - [ ] Mobile layout works (stacked, full-width input)

  **Manual Verification**:
  - [ ] Send a message asking about code
  - [ ] Verify code block has colored syntax
  - [ ] Click copy button - paste elsewhere - content correct
  - [ ] Send another message - chat scrolls down
  - [ ] Test on mobile viewport (375px width)

  **Commit**: YES
  - Message: `feat(ui): implement chat interface with markdown and copy`
  - Files: `src/app/class/*`, `src/components/chat/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 7. Flashcard Generation

  **What to do**:
  - Create flashcard generation API route
  - Design flashcard generation prompt (10 cards per request)
  - Parse AI response into structured flashcard data
  - Save flashcards to database
  - Create "Generate Flashcards" button in class view
  - Add flashcard editing (inline edit front/back)
  - Add flashcard deletion
  - Show generation progress
  - Write flashcard generation tests

  **Must NOT do**:
  - Don't implement spaced repetition (Phase 2)
  - Don't add image support for cards
  - Don't implement card import/export

  **Parallelizable**: YES (can work on after Task 5 complete)

  **References**:
  - Flashcard best practices: https://www.supermemo.com/en/archives1990-2015/articles/20rules
  - Prompt engineering for structured output: https://platform.openai.com/docs/guides/structured-outputs

  **File Structure**:
  ```
  src/
    app/
      api/
        flashcards/
          generate/route.ts  # Generate flashcards
          [id]/route.ts      # CRUD operations
    lib/
      flashcards/
        generator.ts         # Generation logic
        prompts.ts           # Generation prompts
  ```

  **Flashcard Generation API Contract**:
  - **Path**: `POST /api/flashcards/generate`
  - **Request Schema**:
    ```typescript
    interface FlashcardGenerateRequest {
      class_id: string;           // UUID of the class
      document_id?: string;       // Optional: specific document to use
                                  // If omitted, uses all completed documents in class
    }
    ```
  - **Response Schema (success)**:
    ```typescript
    interface FlashcardGenerateResponse {
      flashcards: {
        id: string;
        front: string;
        back: string;
      }[];
      source_documents: string[]; // Document names used for generation
    }
    ```

  **Input Selection Logic**:
  1. **If `document_id` is provided**:
     - Use only that document's content
     - Verify document belongs to user (RLS enforces)
     - Verify document has `embedding_status = 'completed'`
  2. **If `document_id` is omitted**:
     - Fetch ALL documents in the class with `embedding_status = 'completed'`
     - Concatenate content from all documents
  3. **Handling Edge Cases**:
     - **No documents**: Return `{ error: 'No documents available. Upload a document first.' }` (400)
     - **No completed documents**: Return `{ error: 'Documents are still processing. Please wait.' }` (400)
     - **All documents failed**: Return `{ error: 'No documents could be processed. Please re-upload.' }` (400)

  **Content Size Limits**:
  - **Maximum input**: 8000 characters (~2000 tokens, safe for LLM context)
  - **If content exceeds limit**:
    1. If single document: Truncate at 8000 characters, show toast: "Using first portion of document."
    2. If multiple documents: Use documents in order of `created_at` (oldest first) until 8000 char limit reached
       - Include as many complete documents as fit
       - If first document alone exceeds limit, truncate it
  - **Minimum content**: 200 characters (reject if less: "Not enough content to generate flashcards.")

  **Generation Prompt**:
  ```
  Based on the following study material, generate exactly 10 flashcards to help a student learn the key concepts.

  STUDY MATERIAL:
  {document_content}

  OUTPUT FORMAT:
  Return a JSON array of flashcards. Each flashcard should have:
  - "front": A clear question or prompt (max 100 characters)
  - "back": A concise answer (max 300 characters)

  Focus on:
  - Key definitions and concepts
  - Important formulas or procedures
  - Common exam-style questions
  - Relationships between concepts

  IMPORTANT: Return ONLY the JSON array, no markdown code blocks or other text.
  ```

  **Flashcard JSON Robustness**:
  - **Zod Validation Schema**:
    ```typescript
    const FlashcardSchema = z.object({
      front: z.string().min(1).max(200),
      back: z.string().min(1).max(500)
    });
    const FlashcardsArraySchema = z.array(FlashcardSchema).min(5).max(15);
    ```
  - **Parse Strategy**:
    1. Try to parse AI response as JSON directly
    2. If that fails, try to extract JSON from markdown code blocks (```json...```)
    3. Validate with Zod schema
  - **Retry on Failure**:
    - If JSON parse fails OR Zod validation fails: Retry once with prompt suffix "CRITICAL: Return ONLY a valid JSON array with no additional text"
    - On second failure: Return error to user "Could not generate flashcards. Please try again."
    - Do NOT save partial/invalid flashcards
  - **Card Count Handling**: Prompt asks for 10, but accept 5-15 gracefully (don't fail if AI returns 8 or 12)

  **Acceptance Criteria**:
  - [ ] "Generate Flashcards" button visible in class view
  - [ ] Clicking generates 10 flashcards from document content
  - [ ] Flashcards saved to database
  - [ ] Flashcards display in list view
  - [ ] Can edit flashcard front/back inline
  - [ ] Can delete individual flashcards
  - [ ] Generation shows progress indicator
  - [ ] Empty state shows when no flashcards exist

  **Manual Verification**:
  - [ ] Upload a document, click "Generate Flashcards"
  - [ ] Verify 10 cards created
  - [ ] Edit one card's front text - save - verify persisted
  - [ ] Delete a card - verify removed from list
  - [ ] Refresh page - flashcards still there

  **Commit**: YES
  - Message: `feat(flashcards): implement AI flashcard generation`
  - Files: `src/app/api/flashcards/*`, `src/lib/flashcards/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 8. Flashcard Review Interface

  **What to do**:
  - Create flashcard review page with card flip animation
  - Build progress indicator (X of Y cards)
  - Add "Show Answer" button interaction
  - Create navigation (Next, Previous, Shuffle)
  - Build completion screen with stats
  - Make review mobile-friendly (swipe gestures optional)
  - Add keyboard navigation (Space to flip, arrows to navigate)

  **Must NOT do**:
  - Don't implement spaced repetition scoring
  - Don't add review scheduling
  - Don't build performance analytics

  **Parallelizable**: YES (can work on after Task 7 complete)

  **References**:
  - CSS flip animation: https://www.w3schools.com/howto/howto_css_flip_card.asp
  - Framer Motion for animations: https://www.framer.com/motion/

  **File Structure**:
  ```
  src/
    app/
      class/
        [id]/
          flashcards/
            page.tsx         # Review mode
    components/
      flashcards/
        flashcard.tsx        # Single card with flip
        review-controls.tsx  # Navigation buttons
        progress-bar.tsx     # X of Y indicator
        completion.tsx       # End screen
  ```

  **Acceptance Criteria**:
  - [ ] Flashcard shows front initially
  - [ ] Clicking/tapping card flips to reveal back
  - [ ] Space bar flips card
  - [ ] Arrow keys navigate between cards
  - [ ] Progress shows "3 of 10"
  - [ ] "Shuffle" randomizes card order
  - [ ] Completion screen shows at end
  - [ ] "Review Again" restarts from beginning
  - [ ] Works on mobile (tap to flip)

  **Manual Verification**:
  - [ ] Start flashcard review
  - [ ] Flip card - see answer
  - [ ] Press right arrow - next card
  - [ ] Press Space - card flips
  - [ ] Click Shuffle - order changes
  - [ ] Complete all cards - see completion screen

  **Commit**: YES
  - Message: `feat(flashcards): implement review interface with flip animation`
  - Files: `src/app/class/[id]/flashcards/*`, `src/components/flashcards/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 9. UI Polish & Testing

  **What to do**:
  - Create landing page with value proposition
  - Design dashboard with class overview
  - Implement Duolingo-inspired color scheme (vibrant but professional)
  - Add consistent loading skeletons
  - Create toast notifications for actions
  - Ensure 90+ Lighthouse score on all pages
  - Add proper meta tags and Open Graph
  - Write E2E tests for critical flows
  - Fix any accessibility issues (WCAG 2.1 A)
  - Test all features on mobile viewport

  **Must NOT do**:
  - Don't add gamification elements
  - Don't implement dark mode (Phase 2)
  - Don't over-animate (performance)

  **Parallelizable**: NO (depends on all features being complete)

  **References**:
  - Duolingo design system: https://design.duolingo.com/
  - Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
  - Next.js SEO: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

  **File Structure**:
  ```
  src/
    app/
      page.tsx               # Landing page
      dashboard/page.tsx     # Dashboard
      layout.tsx             # Root layout with meta
    components/
      ui/
        loading-skeleton.tsx
        toast.tsx
      landing/
        hero.tsx
        features.tsx
        cta.tsx
  ```

  **Color Palette (Duolingo-inspired)**:
  ```css
  --primary: #58CC02;        /* Duolingo green */
  --primary-dark: #46A302;
  --secondary: #1CB0F6;      /* Blue accent */
  --warning: #FF9600;        /* Orange */
  --error: #FF4B4B;          /* Red */
  --background: #FFFFFF;
  --surface: #F7F7F7;
  --text: #4B4B4B;
  --text-light: #AFAFAF;
  ```

  **Lighthouse CI Setup**:
  - **Installation**: `pnpm add -D @lhci/cli`
  - **Script**: Add to `package.json`: `"lighthouse": "pnpm build && lhci autorun"`
  - **Scope Clarification**: Lighthouse tests **public pages only** (`/`, `/login`)
    - Authenticated pages (`/dashboard`, `/class/[id]`) are tested via Playwright E2E instead
    - This is standard practice since Lighthouse doesn't support session auth easily
  - **Config File**: Create `lighthouserc.js` in project root:
    ```javascript
    module.exports = {
      ci: {
        collect: {
          url: ['http://localhost:3000/', 'http://localhost:3000/login'],
          startServerCommand: 'pnpm start',
          startServerReadyPattern: 'ready on',
          numberOfRuns: 3,
        },
        assert: {
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
          },
        },
        upload: {
          target: 'temporary-public-storage',
        },
      },
    };
    ```
  - **CI Integration**: Add to GitHub Actions workflow

  **E2E Testing Setup**:
  - **Framework**: Playwright (lighter than Cypress, built-in TypeScript)
  - **Installation**: `pnpm add -D @playwright/test && pnpm exec playwright install`
  - **Config File**: Create `playwright.config.ts`
  
  **Playwright Auth Strategy for Supabase SSR** (Cookie-Based Approach):
  
  **IMPORTANT**: `@supabase/ssr` uses HTTP-only cookies for session storage, NOT localStorage.
  This requires a different approach for E2E testing.
  
  **Chosen Method**: API route that sets auth cookies programmatically
  
  **Why Not localStorage?**
  - `@supabase/ssr` middleware reads/writes session from cookies
  - Server Components use cookie-based auth via `cookies()` function
  - localStorage injection would NOT authenticate server-side code
  
  **Test Environment Setup**:
  - **Production**: Google OAuth only (as stated in MVP requirements)
  - **E2E Testing**: Uses a **separate test API route** that authenticates via email/password
  - This does NOT violate "Google only for MVP" because:
    1. The email provider is enabled ONLY in the test/staging Supabase project
    2. The test route is protected by `E2E_TESTING` env var (only set in CI/local E2E, never in production)
    3. Production users still see only Google OAuth
  
  **Required CI Secrets** (set in GitHub Actions):
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (never exposed to client)
  - `TEST_USER_EMAIL`: `test@studium.local`
  - `TEST_USER_PASSWORD`: A secure test password (stored as CI secret)
  
  **One-time Setup** (manual, before first CI run):
  1. In Supabase dashboard → Authentication → Providers → Enable "Email" provider (for test project only)
  2. Disable "Confirm email" in Authentication → Settings (for test project only)
  3. Create test user via Supabase Auth API or dashboard:
     ```bash
     # Using Supabase CLI or dashboard, create a user with:
     # Email: test@studium.local
     # Password: (your secure test password)
     ```
  
  **Test Auth API Route** (E2E testing only):
  ```typescript
  // src/app/api/auth/test-login/route.ts
  // CRITICAL: This route only exists for E2E testing!
  import { createClient } from '@/lib/supabase/server';
  import { NextResponse } from 'next/server';
  
  export async function POST(request: Request) {
    // GUARD 1: Only allow when E2E_TESTING env var is explicitly set
    // This env var is set in CI E2E jobs and local E2E testing, never in production
    if (process.env.E2E_TESTING !== 'true') {
      return NextResponse.json({ error: 'Not available' }, { status: 404 });
    }
    
    // GUARD 2: Only allow the specific test user email (prevents credential stuffing)
    const allowedEmail = process.env.TEST_USER_EMAIL;
    if (!allowedEmail) {
      return NextResponse.json({ error: 'Test user not configured' }, { status: 500 });
    }
    
    const { email, password } = await request.json();
    
    // GUARD 3: Strict allowlist - only the configured test user can log in
    if (email !== allowedEmail) {
      return NextResponse.json({ error: 'Invalid test credentials' }, { status: 403 });
    }
    
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    // Cookies are automatically set by @supabase/ssr
    return NextResponse.json({ user: data.user });
  }
  ```
  
  **Auth Setup File**:
  ```typescript
  // e2e/auth.setup.ts
  import { test as setup, expect } from '@playwright/test';

  const authFile = 'playwright/.auth/user.json';

  setup('authenticate', async ({ page, context }) => {
    // 1. Call the test auth route to get session cookies
    const response = await page.request.post('/api/auth/test-login', {
      data: {
        email: process.env.TEST_USER_EMAIL!,
        password: process.env.TEST_USER_PASSWORD!,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    
    // 2. Navigate to verify auth works (cookies are now set)
    await page.goto('/dashboard');
    
    // 3. Wait for redirect to class page (auto-created)
    await page.waitForURL(/\/class\//, { timeout: 15000 });
    
    // 4. Save cookie state for reuse in tests
    await context.storageState({ path: authFile });
  });
  ```
  
  **Playwright Config**:
  ```typescript
  // playwright.config.ts
  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    testDir: './e2e',
    use: {
      baseURL: 'http://localhost:3000',
    },
    webServer: {
      command: 'pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    projects: [
      // Setup project runs first to create auth state
      { name: 'setup', testMatch: /.*\.setup\.ts/ },
      // Authenticated tests depend on setup and use saved state
      {
        name: 'authenticated',
        testMatch: /.*\.spec\.ts/,
        dependencies: ['setup'],
        use: { storageState: 'playwright/.auth/user.json' },
      },
    ],
  });
  ```
  
  **GitHub Actions Integration**:
  ```yaml
  # In .github/workflows/ci.yml
  e2e:
    runs-on: ubuntu-latest
    env:
      # Enable E2E test auth route (ONLY for CI E2E testing)
      E2E_TESTING: 'true'
      # Server-side mocking for external APIs (Azure, Groq, Gemini)
      MOCK_EXTERNAL_APIS: '1'
      # Supabase credentials (required for auth and database)
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      # Azure OpenAI (placeholder - mocked in E2E)
      AZURE_OPENAI_API_KEY: placeholder-for-build
      AZURE_OPENAI_ENDPOINT: https://placeholder.openai.azure.com
      AZURE_OPENAI_EMBEDDING_DEPLOYMENT: text-embedding-3-small
      # LLM providers (placeholder - mocked in E2E)
      GROQ_API_KEY: placeholder-for-build
      GOOGLE_GENERATIVE_AI_API_KEY: placeholder-for-build
      # Test user credentials
      TEST_USER_EMAIL: test@studium.local
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm exec playwright test
  ```
  
  **E2E Mock Strategy for External APIs**:
  
  E2E tests should NOT call real Azure OpenAI or Groq/Gemini APIs because:
  1. Costs money per API call
  2. Rate limits can cause flaky tests
  3. Tests should be deterministic
  
  **IMPORTANT**: Playwright `page.route()` only intercepts browser-side requests. Our external API calls happen server-side in Next.js route handlers. We need application-level mocking.
  
  **Server-Side Mocking Strategy** (using environment flag):
  
  ```typescript
  // src/lib/ai/providers/mock.ts
  // Mock provider used when MOCK_EXTERNAL_APIS=1
  
  const MOCK_EMBEDDING = new Array(1536).fill(0.1);
  
  export async function generateMockEmbedding(text: string): Promise<number[]> {
    // Deterministic mock: hash text to create consistent embedding
    return MOCK_EMBEDDING;
  }
  
  export async function generateMockChatResponse(message: string): Promise<string> {
    return `Mock AI response for testing. Your question was about: "${message.substring(0, 50)}..."`;
  }
  ```
  
  ```typescript
  // src/lib/embeddings/azure-openai.ts (with mock support)
  import { AzureOpenAI } from 'openai';
  import { generateMockEmbedding } from '@/lib/ai/providers/mock';
  
  export async function generateEmbedding(text: string): Promise<number[]> {
    // Use mock in test environment
    if (process.env.MOCK_EXTERNAL_APIS === '1') {
      return generateMockEmbedding(text);
    }
    
    const client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: '2024-02-01',
    });
    
    const response = await client.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: text,
    });
    return response.data[0].embedding;
  }
  ```
  
  ```typescript
  // src/lib/ai/service.ts (with mock support)
  import { generateMockChatResponse } from '@/lib/ai/providers/mock';
  
  export async function chat(params: ChatParams): Promise<ChatResponse> {
    // Use mock in test environment
    if (process.env.MOCK_EXTERNAL_APIS === '1') {
      return {
        content: await generateMockChatResponse(params.message),
        rateLimited: false,
      };
    }
    
    // Real implementation: Groq → Gemini fallback
    // ...
  }
  ```
  
  **CI Environment Variable**:
  ```yaml
  # In .github/workflows/ci.yml e2e job
  env:
    MOCK_EXTERNAL_APIS: '1'  # Enable server-side mocking for E2E tests
    # ... other env vars
  ```
  
  **Why This Works**:
  - Mocking happens inside Next.js server code, not browser
  - Tests are deterministic (same input → same output)
  - No external API calls = no flakiness, no costs
  - Real Supabase is still used (database operations are tested for real)
  
  **Note on CI Secrets**: Even though APIs are mocked in E2E tests, the env vars should still be set (can be placeholder values) for the app to start without "missing env var" errors during build.
  
  **Test Flows to Implement**:
    1. **Auth Flow**: Unauthenticated user visiting `/dashboard` → redirected to `/login`
    2. **Authenticated Flows** (use saved session):
       - Upload PDF → document appears in list with "Processing..." then "Ready"
       - Send chat message → receive AI response with markdown rendering
       - Click "Generate Flashcards" → 10 cards appear
       - Start review → flip cards → complete deck → see completion screen
  - **Test File Structure**:
    ```
    e2e/
      auth.setup.ts      # Creates authenticated session
      auth.spec.ts       # Tests redirect behavior (no session needed)
      upload.spec.ts     # Tests upload flow (uses saved session)
      chat.spec.ts       # Tests chat flow (uses saved session)
      flashcards.spec.ts # Tests flashcard flow (uses saved session)
    playwright/
      .auth/
        user.json        # Saved session state (gitignored)
    ```
  - **CI Command**: `pnpm exec playwright test`

  **Acceptance Criteria**:
  - [ ] Landing page explains product value
  - [ ] Dashboard shows class with status
  - [ ] Color scheme is vibrant and consistent
  - [ ] Loading states use skeleton components
  - [ ] Toast notifications for: upload success, flashcard generated, errors
  - [ ] Lighthouse Performance >= 90 on `/` and `/login`
  - [ ] Lighthouse Accessibility >= 90 on `/` and `/login`
  - [ ] Lighthouse Best Practices >= 90 on `/` and `/login`
  - [ ] Lighthouse SEO >= 90 on `/` and `/login`
  - [ ] All E2E Playwright tests pass (authenticated flows)
  - [ ] All pages work on 375px mobile viewport
  - [ ] No console errors in production build

  **Manual Verification**:
  - [ ] Run `pnpm build && pnpm start`
  - [ ] Run Lighthouse on `/` and `/login` - verify all scores >= 90
  - [ ] Run `pnpm exec playwright test` - verify all E2E tests pass
  - [ ] Test complete flow on mobile device/emulator

  **Commit**: YES
  - Message: `feat(ui): add landing page and polish for 90+ Lighthouse score`
  - Files: `src/app/page.tsx`, `src/app/dashboard/*`, `src/components/landing/*`, `src/components/ui/*`
  - Pre-commit: `pnpm test && pnpm build`

---

- [ ] 10. Deployment (DigitalOcean + Custom Domain)

  **What to do**:
  - Claim .TECH domain (studium.tech) from GitHub Student Pack
  - Configure DigitalOcean App Platform
  - Set environment variables in DigitalOcean
  - Connect GitHub repo for auto-deploy
  - Configure custom domain with SSL
  - Set up GitHub Actions for CI/CD
  - Create comprehensive README with:
    - Project description and screenshots
    - Tech stack overview
    - Local development setup
    - Environment variables guide
    - Architecture diagram
  - Add demo video/GIF to README
  - Create CONTRIBUTING.md
  - Final production test

  **DigitalOcean App Platform Setup**:
  1. Go to DigitalOcean → Apps → Create App
  2. Connect GitHub repository
  3. Configure build settings:
     - Build command: `pnpm build`
     - Run command: `pnpm start`
     - Node.js version: 20
  4. Add environment variables (from `.env.local`)
  5. Configure domain: studium.tech
  6. Enable auto-deploy from main branch

  **DigitalOcean Technical Details**:
  - **PORT Binding**: Next.js automatically binds to the `PORT` environment variable (DigitalOcean sets this)
  - **Health Check**: DigitalOcean pings `/` by default - ensure landing page loads quickly
  - **Build Output**: Next.js standalone output works with App Platform
  - **Logs**: Access via DigitalOcean dashboard → Apps → Runtime Logs

  **Domain Setup**:
  1. Claim .TECH domain from GitHub Student Pack
  2. In .TECH dashboard, add DNS records pointing to DigitalOcean
  3. In DigitalOcean, add custom domain
  4. SSL auto-configured by DigitalOcean

  **Supabase OAuth Redirect URLs**:
  Add ALL of these to Supabase → Auth → URL Configuration → Redirect URLs:
  - `https://studium.tech/auth/callback` (production)
  - `http://localhost:3000/auth/callback` (local development)
  
  **Note on DigitalOcean Preview Deployments**:
  Supabase does NOT support wildcard patterns like `https://*.ondigitalocean.app`. Each preview deployment gets a unique URL (e.g., `https://studium-abc123.ondigitalocean.app`).
  
  **Options for preview deployment auth**:
  1. **Recommended**: Disable auto-deploy previews, only deploy from `main` branch (simplest for MVP)
  2. **Alternative**: Manually add each preview URL to Supabase when needed (tedious but works)
  3. **Future**: Use a custom domain with wildcard subdomain (e.g., `*.preview.studium.tech`) - requires DNS setup

  **Must NOT do**:
  - Don't configure complex monitoring (basic DigitalOcean metrics are fine)
  - Don't add paid services beyond student credits
  - Don't skip SSL configuration

  **Parallelizable**: NO (final step)

  **References**:
  - DigitalOcean App Platform: https://docs.digitalocean.com/products/app-platform/
  - .TECH domain claim: Part of GitHub Student Pack
  - GitHub Actions: https://docs.github.com/en/actions

  **File Structure**:
  ```
  .github/
    workflows/
      ci.yml               # Test + build on PR
      deploy.yml           # Trigger DigitalOcean deploy
  README.md                # Project documentation
  CONTRIBUTING.md          # Contribution guide
  ```

  **CI/CD Workflow**:
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v2
          with:
            version: 8
        - uses: actions/setup-node@v4
          with:
            node-version: 20
            cache: 'pnpm'
        - run: pnpm install
        - run: pnpm test
        - run: pnpm build
  ```

  **Acceptance Criteria**:
  - [ ] App deployed to studium.tech (or similar .TECH domain)
  - [ ] SSL certificate active (https works)
  - [ ] All environment variables configured in DigitalOcean
  - [ ] GitHub Actions runs tests on PR
  - [ ] Auto-deploy triggers on push to main
  - [ ] README has project description
  - [ ] README has screenshots/demo GIF
  - [ ] README has setup instructions
  - [ ] README has architecture overview
  - [ ] Production app fully functional (complete flow test)

  **Manual Verification**:
  - [ ] Visit https://studium.tech (or your domain)
  - [ ] Verify SSL certificate (padlock icon)
  - [ ] Sign in with Google
  - [ ] Upload a document
  - [ ] Chat about the document
  - [ ] Generate flashcards
  - [ ] Review flashcards
  - [ ] Sign out
  - [ ] All features work as expected

  **Commit**: YES
  - Message: `docs: add README, CI/CD, and deployment configuration`
  - Files: `.github/workflows/*`, `README.md`, `CONTRIBUTING.md`
  - Pre-commit: `pnpm test && pnpm build`

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 0 | `chore: initial project setup` | All initial | `pnpm build` |
| 1 | `feat(db): add Supabase schema` | `supabase/*`, `src/lib/supabase/*` | `pnpm build` |
| 2 | `feat(auth): implement Google OAuth` | `src/app/auth/*`, `src/middleware.ts` | `pnpm test` |
| 3 | `feat(upload): implement file upload` | `src/app/api/upload/*`, `src/lib/file-processing/*` | `pnpm test` |
| 4 | `feat(rag): implement embedding pipeline` | `src/lib/embeddings/*` | `pnpm test` |
| 5 | `feat(ai): implement chat service` | `src/lib/ai/*`, `src/app/api/chat/*` | `pnpm test` |
| 6 | `feat(ui): implement chat interface` | `src/components/chat/*` | `pnpm build` |
| 7 | `feat(flashcards): implement generation` | `src/lib/flashcards/*`, `src/app/api/flashcards/*` | `pnpm test` |
| 8 | `feat(flashcards): implement review UI` | `src/components/flashcards/*` | `pnpm build` |
| 9 | `feat(ui): polish and Lighthouse optimization` | `src/app/page.tsx`, `src/components/ui/*` | Lighthouse >= 90 |
| 10 | `docs: deployment and documentation` | `README.md`, `.github/*` | Production test |

---

## Success Criteria

### Verification Commands
```bash
pnpm build          # Expected: Build successful
pnpm test           # Expected: All tests pass
pnpm lighthouse     # Expected: All scores >= 90
```

### Final Checklist
- [ ] All "Must Have" features implemented
- [ ] All "Must NOT Have" guardrails respected
- [ ] 90+ Lighthouse score on public pages (`/`, `/login`)
- [ ] Complete user flow works in production
- [ ] README with screenshots exists
- [ ] Code pushed to GitHub
- [ ] Live demo URL accessible at studium.tech

---

## GitHub Student Pack Cost Savings

| Resource | Without Student Pack | With Student Pack |
|----------|---------------------|-------------------|
| Hosting (1 year) | ~$60 (Vercel Pro) | **$0** ($200 DO credit) |
| Embeddings (Azure) | ~$20 | **$0** ($100 Azure credit) |
| Domain (.tech) | ~$50/year | **$0** (free 1 year) |
| GitHub Copilot | ~$100/year | **$0** (free for students) |
| **Total Year 1** | **~$230** | **$0** |

---

## Phase 2 Features (Post-MVP)

For reference, these features are explicitly OUT of scope for MVP:

1. **Multiple Classes** - Tiered (3 free, premium for more)
2. **BYOK Model Selection** - User-provided API keys
3. **Quiz Feature** - MCQ + short answer with AI grading
4. **Spaced Repetition** - SM-2 algorithm for flashcards
5. **Dark Mode** - Theme toggle
6. **Flashcard Export** - Anki format export
7. **Streaming Responses** - Real-time token display
8. **Advanced RAG** - Re-ranking, HyDE
9. **Analytics** - Usage tracking, study stats
