# Studium

An AI-powered study companion that helps you learn from your documents. Upload PDFs and Word documents, chat with an AI tutor about the content, and generate flashcards for effective studying.

## Features

- **Document Upload**: Upload PDF and DOCX files to create your study materials
- **AI Chat**: Ask questions about your documents with context-aware AI responses
- **Flashcard Generation**: Automatically generate flashcards from your documents
- **Secure Storage**: Documents are stored securely with per-user access control

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI Chat**: DigitalOcean Gradient AI Platform (Llama 3.3 70B via Serverless Inference)
- **Embeddings**: HuggingFace Inference API (all-MiniLM-L6-v2)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: DigitalOcean App Platform

## Quick Start

### Prerequisites

- Node.js 18+
- DigitalOcean account (with Gradient AI Platform access)
- HuggingFace account (free)
- Supabase account

### 1. Clone and Install

```bash
git clone https://github.com/nicovalerian/studium.git
cd studium
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DigitalOcean Gradient AI Platform
DO_GRADIENT_API_KEY=your-do-gradient-api-key
DO_GRADIENT_CHAT_MODEL=llama3.3-70b-instruct

# HuggingFace
HUGGINGFACE_API_KEY=hf_your-token
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a `documents` storage bucket (private)
4. Run `supabase/storage-policies.sql` in the SQL Editor

### 4. Set Up DigitalOcean Gradient AI Platform

1. Go to [DigitalOcean Gradient AI Platform](https://cloud.digitalocean.com/gen-ai)
2. Navigate to **Serverless Inference** tab
3. Create a **Model Access Key**
4. Copy the key to `DO_GRADIENT_API_KEY`

### 5. Set Up HuggingFace

1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create a new access token (read permissions)
3. Copy the token to `HUGGINGFACE_API_KEY`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command            | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run start`    | Start production server   |
| `npm run test`     | Run tests in watch mode   |
| `npm run test:run` | Run tests once            |
| `npm run lint`     | Run ESLint                |
| `npm run format`   | Format code with Prettier |

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── class/             # Class pages (chat, flashcards)
│   ├── dashboard/         # Dashboard page
│   └── login/             # Login page
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── ai/               # AI service (DO Gradient provider)
│   ├── embeddings/       # Embedding generation (HuggingFace)
│   ├── file-processing/  # PDF and DOCX parsing
│   ├── flashcards/       # Flashcard generation
│   └── supabase/         # Supabase client utilities
└── test/                  # Test files
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions using DigitalOcean App Platform with GitHub Student Pack credits.

## License

MIT
