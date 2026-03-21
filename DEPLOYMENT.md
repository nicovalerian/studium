# Studium deployment guide

This guide covers the current production shape of Studium: Next.js on DigitalOcean App Platform, Supabase for auth/database/storage, DigitalOcean Gradient AI for chat generation, and HuggingFace for embeddings.

## Pre-deploy checklist

Before wiring up infrastructure, make sure all of these are true locally:

- `npm run build` succeeds.
- Your Supabase schema and storage policies are up to date.
- You know the final public app URL you want to use for `NEXT_PUBLIC_SITE_URL`.
- You have DigitalOcean Gradient and HuggingFace credentials ready.

## 1. Supabase

### Database and storage

1. Run [`supabase/schema.sql`](./supabase/schema.sql).
2. Create a private storage bucket named `documents`.
3. Run [`supabase/storage-policies.sql`](./supabase/storage-policies.sql).

The schema creates:

- one class per user
- uploaded documents and document chunks
- chat messages
- flashcards
- the pgvector similarity search function used by chat

### Auth configuration

Set the following in Supabase Auth:

- Site URL: your public app origin, for example `https://studium.example.com`
- Redirect URL: `https://your-domain/auth/callback`
- Redirect URL: `https://your-domain/auth/confirm`

If you keep Google OAuth enabled in the UI, also configure the Google provider in Supabase. The provider redirect URI is the Supabase callback URL shown in the Supabase dashboard. The app itself then returns users through `/auth/callback`.

If you want a custom confirmation email, start from [`supabase/templates/confirmation.html`](./supabase/templates/confirmation.html).

## 2. AI providers

### DigitalOcean Gradient

Create a serverless inference access key and set:

- `DO_GRADIENT_API_KEY`
- `DO_GRADIENT_CHAT_MODEL`

The default chat model in the codebase is `llama3.3-70b-instruct`.

### HuggingFace

Create an access token and set:

- `HUGGINGFACE_API_KEY`
- `HUGGINGFACE_EMBEDDING_MODEL`

The current embedding default is `sentence-transformers/all-MiniLM-L6-v2`, and the Supabase schema expects 384-dimensional embeddings.

## 3. App Platform configuration

Create a DigitalOcean App Platform web service with:

- Build command: `npm run build`
- Run command: `npm run start`
- HTTP port: `3000`

Set these environment variables in the app:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public origin for auth redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Needed for document embedding writes |
| `DO_GRADIENT_API_KEY` | Yes | Chat and flashcard generation |
| `DO_GRADIENT_CHAT_MODEL` | No | Defaults to `llama3.3-70b-instruct` |
| `HUGGINGFACE_API_KEY` | Yes | Embedding generation |
| `HUGGINGFACE_EMBEDDING_MODEL` | No | Defaults to `sentence-transformers/all-MiniLM-L6-v2` |

Mark secrets as encrypted in App Platform.

## 4. Post-deploy auth pass

After the first successful deployment:

1. Update Supabase Auth site and redirect URLs to the deployed domain if you initially used localhost values.
2. If Google OAuth is enabled, make sure the Google Cloud OAuth client allows the Supabase callback URL for the same Supabase project.
3. Open the deployed app and verify both `/auth/callback` and `/auth/confirm` flows land users back in the workspace.

## 5. Production smoke test

Run through this quick checklist:

- Landing page renders
- Guest dashboard preview loads
- Email sign-up sends a confirmation link
- Confirmed users can upload a PDF or DOCX
- Uploaded documents reach `completed` embedding status
- Chat returns an answer with document context
- Flashcard generation succeeds
- Sign-out and sign-in restore the session correctly

## Troubleshooting

### Upload succeeds but processing fails

- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set.
- Confirm `HUGGINGFACE_API_KEY` is valid.
- Check the app logs for embedding or insert failures.

### Chat or flashcards return "AI service unavailable"

- Confirm `DO_GRADIENT_API_KEY` is set and valid.
- Check whether the configured model is available to that account.

### Users cannot unlock protected actions after sign-up

- Confirm the redirect URLs include both `/auth/callback` and `/auth/confirm`.
- Confirm the user has a verified email in Supabase Auth.

### Google sign-in fails after deployment

- Confirm the Google provider is enabled in Supabase.
- Confirm the OAuth client in Google Cloud allows the Supabase callback URI for your project.
