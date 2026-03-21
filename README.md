# Studium

Studium is a document-first study workspace built with Next.js and Supabase. Users can preview the workspace as a guest, sign in with Google or email/password, upload PDF or DOCX files, chat against retrieved document context, and generate flashcards from processed study materials.

## What the app does

- Guest users can explore the dashboard before signing in.
- Verified users can upload PDF and DOCX files up to 10 MB.
- Uploaded documents are parsed, chunked, embedded, and indexed in Supabase pgvector.
- Chat responses use retrieval over document chunks with a small document-content fallback when retrieval returns nothing.
- Flashcards are generated from completed documents and stored per class.
- Email verification gates uploads, chat, flashcard generation, and document management.

## Stack

- Next.js 14 App Router with React 18 and TypeScript
- Supabase for auth, Postgres, storage, and SSR session handling
- DigitalOcean Gradient AI for chat and flashcard generation
- HuggingFace Inference API for embeddings
- Tailwind CSS, Radix UI, Vitest, Playwright, and Lighthouse CI

## Prerequisites

- Node.js 18+
- An npm-compatible environment
- A Supabase project
- A DigitalOcean Gradient API key
- A HuggingFace access token

Google OAuth is optional, but the current UI includes a Google sign-in button. Email/password auth also works and requires email confirmation before protected actions are unlocked.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

DO_GRADIENT_API_KEY=your-do-gradient-api-key
DO_GRADIENT_CHAT_MODEL=llama3.3-70b-instruct

HUGGINGFACE_API_KEY=hf_your-token
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Optional for local UI and test work:

```env
MOCK_EXTERNAL_APIS=1
```

That mock flag short-circuits external chat and embedding calls.

### 3. Set up Supabase

1. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
2. Create a private storage bucket named `documents`.
3. Run [`supabase/storage-policies.sql`](./supabase/storage-policies.sql).
4. In Supabase Auth, set the site URL to your app origin.
5. Add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`

If you use Google OAuth, also configure the Google provider in Supabase. The repository includes an optional confirmation email template at [`supabase/templates/confirmation.html`](./supabase/templates/confirmation.html).

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server |
| `npm run lint` | Run Next.js linting |
| `npm run format` | Format the repo with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run e2e` | Run Playwright end-to-end tests |
| `npm run e2e:ui` | Open Playwright UI mode |
| `npm run lighthouse` | Run Lighthouse CI |

## Project layout

```text
src/
|- app/
|  |- api/              # Upload, chat, flashcard, and document routes
|  |- auth/             # OAuth and email confirmation handlers
|  |- class/            # Main study workspace
|  |- dashboard/        # Guest preview and class bootstrap
|  `- login/            # Sign-in and sign-up flow
|- components/
|  |- auth/
|  |- chat/
|  |- documents/
|  |- flashcards/
|  `- landing/
|- hooks/
|- lib/
|  |- ai/
|  |- auth/
|  |- embeddings/
|  |- file-processing/
|  |- flashcards/
|  `- supabase/
|- test/
`- types/
```

## Deployment

Deployment notes live in [`DEPLOYMENT.md`](./DEPLOYMENT.md). That guide is intentionally scoped to the current stack and auth flow instead of the original bootstrap-only notes.
