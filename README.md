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
- **AI**: Azure AI Foundry (GPT-5-nano for chat, text-embedding-3-small for embeddings)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: DigitalOcean App Platform

## Quick Start

### Prerequisites

- Node.js 18+
- Azure account with AI Foundry access
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

# Azure AI Foundry
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-5-nano
```

### 3. Set Up Supabase

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a `documents` storage bucket (private)
4. Run `supabase/storage-policies.sql` in the SQL Editor

### 4. Set Up Azure AI Foundry

1. Create an Azure AI Foundry resource
2. Deploy `gpt-5-nano` model with deployment name `gpt-5-nano`
3. Deploy `text-embedding-3-small` model with deployment name `text-embedding-3-small`
4. Copy the endpoint and API key from Keys and Endpoint

### 5. Run Development Server

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
│   ├── ai/               # AI service (Azure Foundry provider)
│   ├── embeddings/       # Embedding generation and search
│   ├── file-processing/  # PDF and DOCX parsing
│   ├── flashcards/       # Flashcard generation
│   └── supabase/         # Supabase client utilities
└── test/                  # Test files
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions using DigitalOcean App Platform with GitHub Student Pack credits.

## License

MIT
