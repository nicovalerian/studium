# Copilot Instructions for Studium

## Project Overview

Studium is a document-first study workspace built with Next.js 14 App Router, Supabase, and AI-powered features. Users upload PDF/DOCX files, chat against retrieved document context, and generate flashcards from their study materials.

**Stack:**
- Next.js 14 (App Router) + React 18 + TypeScript (strict mode)
- Supabase (auth, Postgres with pgvector, storage, SSR)
- DigitalOcean Gradient AI for chat and flashcard generation
- HuggingFace Inference API for embeddings (384-dimensional vectors)
- Tailwind CSS + Radix UI (shadcn/ui components)
- Vitest for unit tests, Playwright for E2E tests

## Build, Test, and Lint Commands

```bash
# Development
npm run dev                  # Start Next.js dev server on :3000
npm install                  # Install dependencies after package.json changes

# Testing
npm run test                 # Run Vitest in watch mode
npm run test:run             # Run Vitest once (CI mode)
npm run test:coverage        # Run with coverage report

# E2E Testing
npm run e2e                  # Run Playwright tests (requires build first)
npm run e2e:ui               # Open Playwright UI mode

# Linting & Formatting
npm run lint                 # Run ESLint (Next.js config + Prettier)
npm run format               # Format with Prettier (includes Tailwind plugin)
npm run format:check         # Check formatting without modifying

# Production
npm run build                # Build for production
npm run start                # Start production server
npm run lighthouse           # Run Lighthouse CI audit
```

**Running a single test:**
```bash
# Vitest (unit)
npm run test -- src/lib/auth/access.test.ts

# Playwright (E2E)
npm run e2e -- e2e/auth.spec.ts
```

**Before opening a PR, run:**
```bash
npm run lint && npm run format:check && npm run test:run && npm run build
```

## Architecture

### Auth & Access Control

The app has **three access states** defined in `src/lib/auth/access.ts`:
- `guest` - No user session, can view landing and dashboard preview
- `unverified` - Signed in but email not confirmed
- `verified` - Email confirmed, unlocks uploads, chat, flashcards, and document management

**Email verification gates all protected actions**. API routes return `EMAIL_VERIFICATION_REQUIRED_ERROR_CODE` (403) if `user.email_confirmed_at` is null.

### Supabase Client Patterns

**Three client types** based on context:

1. **Server Components/Route Handlers:** `createClient()` from `@/lib/supabase/server`
   - Uses cookies() from Next.js
   - Auto-refreshes session via middleware
   - Pattern: `const supabase = await createClient();`

2. **Client Components:** `createBrowserClient()` from `@/lib/supabase/client`
   - Browser-only Supabase client
   - Manages auth state changes
   - Pattern: Import once, use in effects/handlers

3. **Middleware:** `updateSession()` from `@/lib/supabase/middleware`
   - Refreshes auth tokens on each request
   - Runs on all routes except static assets
   - See `src/middleware.ts` config

**Never mix client types.** Server Components cannot use `createBrowserClient()`.

### Document Processing Pipeline

Upload → Parse → Chunk → Embed → Index

1. **Upload** (`/api/upload`):
   - Validates file type (PDF/DOCX) and size (≤10MB)
   - Uploads to Supabase storage `documents` bucket
   - Creates `documents` row with `status: 'pending'`

2. **Parse** (background):
   - PDF: `unpdf` library extracts text
   - DOCX: `mammoth` converts to plain text
   - Stored in `documents.content` column
   - Status → `processing`

3. **Chunk** (`src/lib/embeddings/chunker.ts`):
   - Splits text into 500-character chunks with 50-char overlap
   - Creates `document_chunks` rows
   - Unicode-aware splitting (see `unicode.ts`)

4. **Embed** (`src/lib/embeddings/generate.ts`):
   - Calls HuggingFace API for each chunk
   - Generates 384-dim vectors
   - Stored in `document_chunks.embedding` (pgvector)
   - Status → `completed`

5. **Index** (Supabase):
   - pgvector similarity search via `match_document_chunks` function
   - Used by chat retrieval

**Status field drives UI state.** Components poll `/api/documents/[id]/status` until `completed` or `failed`.

### Chat Retrieval Strategy

**Two-tier context building** in `/api/chat`:

1. **Primary:** Semantic search via `searchSimilarChunks()`
   - Embeds user query with HuggingFace
   - Searches pgvector index
   - Returns top-N chunks by cosine similarity

2. **Fallback:** Full document content (if retrieval empty)
   - Fetches document text directly
   - Truncates to `MAX_FALLBACK_CONTEXT_LENGTH` (4000 chars)
   - Ensures response even with no embeddings

**Context format:**
```
[Source: Document Name]
chunk text...

[Source: Another Doc]
more text...
```

This context + message history + user query → DigitalOcean Gradient LLM.

### Flashcard Generation

**Triggered per class** (user has one class):
- Frontend calls `/api/flashcards/generate`
- Fetches all `completed` documents for the class
- Sends combined content to Gradient AI with prompt from `src/lib/ai/prompts.ts`
- Parses structured JSON response
- Stores in `flashcards` table

Flashcards are **class-scoped**, not document-scoped.

### AI Provider Abstraction

**Main interface:** `src/lib/ai/service.ts`
- Exports `chat()` function
- Conditionally uses `mock.ts` or `do-gradient.ts` based on `MOCK_EXTERNAL_APIS` env var
- Mock provider returns placeholder responses for local UI testing

**Adding a new provider:** Create `providers/your-provider.ts`, implement `ChatProvider` interface, update `service.ts` conditional.

### Path Aliases

TypeScript and bundler use `@/*` for `src/*`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
```

**Never use relative imports across top-level `src/` folders.** Use aliases instead.

## Key Conventions

### TypeScript

- **Strict mode enabled** - all code must pass `strict: true`
- **Explicit types for API contracts** - Define types in `src/lib/*/types.ts` or inline
- **No implicit any** - Always annotate function params and return types for exports
- **Use Supabase types** - Import `Database` type from generated types when available

### Component Structure

- **Server Components by default** - Add `'use client'` only when needed (state, effects, browser APIs)
- **Co-locate feature components** - `components/auth/`, `components/chat/`, etc.
- **Radix UI primitives** - Use shadcn/ui components from `@/components/ui/`
- **Composition over configuration** - Prefer component composition to heavy prop drilling

### Styling

- **Tailwind utility classes** - No custom CSS files except `globals.css`
- **Use CSS variables** - Theme colors defined in `globals.css` (e.g., `bg-background`, `text-foreground`)
- **Responsive defaults** - Mobile-first, then `md:` and `lg:` breakpoints
- **Prettier sorts classes** - `prettier-plugin-tailwindcss` handles order

### Environment Variables

- **Public vars:** `NEXT_PUBLIC_*` - Available in browser
- **Server-only vars:** No prefix - Never expose in client code
- **Mock flag:** `MOCK_EXTERNAL_APIS=1` - Bypasses external AI calls for local development
- **Required for production:** See `DEPLOYMENT.md` for full list

### Error Handling

- **API routes return JSON errors:**
  ```typescript
  return NextResponse.json({ error: 'Message', code: 'ERROR_CODE' }, { status: 4xx });
  ```
- **Client shows toasts** - Use `@/components/ui/toast` for user-facing errors
- **Log server errors** - Always `console.error()` before returning 500
- **Auth errors use codes** - `EMAIL_VERIFICATION_REQUIRED_ERROR_CODE` for gated actions

### Database Conventions

- **One class per user** - Created on first sign-in
- **Foreign keys enforce ownership** - All resources link to `classes.user_id`
- **Status enums as text** - `pending | processing | completed | failed`
- **Timestamps** - `created_at` and `updated_at` on all tables
- **Supabase RLS** - Storage policies in `supabase/storage-policies.sql`

### Testing

- **Vitest setup:** `src/test/setup.ts` configures jsdom and React Testing Library
- **Test files:** Co-locate with source (e.g., `access.test.ts` next to `access.ts`)
- **E2E auth:** Playwright setup in `e2e/auth.setup.ts` creates saved state
- **Test naming:** `describe('ModuleName', () => { it('should ...', () => {})})`
- **Mock external APIs** - Never call real AI services in tests

### Git & Commits

- **Conventional commits** - `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **No secrets** - Never commit `.env.local`
- **Update docs** - If you change setup, auth, scripts, or deployment, update `README.md`, `CONTRIBUTING.md`, or `DEPLOYMENT.md`

## Important Files

- `supabase/schema.sql` - Full database schema (classes, documents, chunks, chat, flashcards)
- `supabase/storage-policies.sql` - RLS policies for document storage
- `src/middleware.ts` - Auth token refresh middleware
- `src/lib/auth/access.ts` - Three-state access model and helpers
- `src/lib/ai/prompts.ts` - System prompts for chat and flashcard generation
- `src/lib/embeddings/chunker.ts` - Text splitting logic
- `components.json` - shadcn/ui configuration

## Common Tasks

### Adding a new API route
1. Create `src/app/api/your-route/route.ts`
2. Auth: `const supabase = await createClient();` then `getUser()`
3. Check `user.email_confirmed_at` if action is protected
4. Return `NextResponse.json()` with appropriate status codes
5. Add error handling and logging

### Adding a new UI component
1. For Radix primitives: `npx shadcn-ui@latest add component-name`
2. For feature components: Create in `src/components/feature-name/`
3. Use `'use client'` only if state/effects/browser APIs are needed
4. Import from `@/components/...`

### Modifying the document pipeline
- **Parser changes:** Edit `src/lib/file-processing/pdf.ts` or `docx.ts`
- **Chunking changes:** Edit `src/lib/embeddings/chunker.ts` (test: `chunker.test.ts`)
- **Embedding changes:** Edit `src/lib/embeddings/generate.ts`
- **Search changes:** Edit `src/lib/embeddings/search.ts`

**After schema changes:** Re-run `supabase/schema.sql` in Supabase SQL editor.

### Switching AI providers
1. Create provider in `src/lib/ai/providers/your-provider.ts`
2. Implement `ChatProvider` interface from `types.ts`
3. Update `src/lib/ai/service.ts` to conditionally use new provider
4. Update `.env.local.example` with new required vars
5. Update `DEPLOYMENT.md` with configuration steps

## Quick Reference

**Supabase tables:**
- `classes` - One per user
- `documents` - User uploads (status: pending → processing → completed/failed)
- `document_chunks` - Chunked text + embeddings (pgvector)
- `chat_messages` - Chat history per class
- `flashcards` - Generated per class

**Storage buckets:**
- `documents` - Private bucket, RLS-protected, 10MB file limit

**Auth flows:**
- Email/password → Confirmation email → `/auth/confirm` → Verified
- Google OAuth → `/auth/callback` → Auto-verified (if email confirmed by Google)

**Next.js route groups:**
- `/` - Landing page
- `/login` - Sign-in/sign-up (redirects verified users)
- `/dashboard` - Guest preview or class bootstrap
- `/class/[id]` - Main workspace (documents, chat, flashcards)
- `/api/*` - Backend routes (uploads, chat, flashcards, documents)
