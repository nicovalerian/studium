<div align="center">

# 📚 Studium

**AI-Powered Study Workspace**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-green?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Transform your study materials into an interactive AI-powered workspace. Upload documents, chat with your content using retrieval-augmented generation, and generate flashcards automatically.

[Features](#-features) • [Quick Start](#-quick-start) • [Stack](#-stack) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 Core Capabilities

- **📄 Document Upload** - Support for PDF and DOCX files (up to 10 MB)
- **🤖 AI-Powered Chat** - Context-aware conversations using RAG (Retrieval-Augmented Generation)
- **🎴 Flashcard Generation** - Automatically create study flashcards from your documents
- **👁️ Guest Preview** - Explore the dashboard before signing in

### 🔐 Authentication & Security

- **Multiple Auth Methods** - Email/password or Google OAuth
- **Email Verification** - Required before accessing protected features
- **Secure Storage** - Private document storage with Row Level Security

### 🚀 Document Processing Pipeline

1. **Parse** - Extract text from PDF/DOCX files
2. **Chunk** - Intelligently split content into 500-character segments
3. **Embed** - Generate 384-dimensional vectors using HuggingFace
4. **Index** - Store in Supabase pgvector for fast similarity search
5. **Retrieve** - Power chat with context-aware responses

## 🛠️ Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript (strict mode) |
| **Styling** | Tailwind CSS, Radix UI (shadcn/ui components) |
| **Backend** | Supabase (Auth, Postgres, Storage, SSR) |
| **AI/ML** | DigitalOcean Gradient AI, HuggingFace Inference API |
| **Database** | PostgreSQL with pgvector extension |
| **Testing** | Vitest (unit), Playwright (E2E), Lighthouse CI |
| **Code Quality** | ESLint, Prettier |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ with npm
- **Supabase** project ([create one free](https://supabase.com))
- **DigitalOcean Gradient** API key ([get started](https://www.digitalocean.com/))
- **HuggingFace** access token ([create token](https://huggingface.co/settings/tokens))

> **Note:** Google OAuth is optional. The app fully supports email/password authentication with email confirmation.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/nicovalerian/studium.git
cd studium
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

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

> **💡 Tip:** Set `MOCK_EXTERNAL_APIS=1` to bypass external AI calls during local UI development.

**4. Set up Supabase**

1. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
2. Create a private storage bucket named `documents`.
3. Run [`supabase/storage-policies.sql`](./supabase/storage-policies.sql).
4. In Supabase Auth, set the site URL to your app origin.
5. Add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/confirm`

**Optional:** Configure Google OAuth provider in Supabase and use the email template at [`supabase/templates/confirmation.html`](./supabase/templates/confirmation.html).

**5. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development guidelines and testing practices
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[Supabase Schema](./supabase/schema.sql)** - Complete database schema

## 📜 Available Scripts

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

## 📁 Project Structure

```text
studium/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (upload, chat, flashcards, documents)
│   │   ├── auth/             # OAuth and email confirmation handlers
│   │   ├── class/            # Main study workspace
│   │   ├── dashboard/        # Guest preview and class bootstrap
│   │   └── login/            # Sign-in and sign-up flow
│   ├── components/
│   │   ├── auth/             # Authentication components
│   │   ├── chat/             # Chat interface
│   │   ├── documents/        # Document management
│   │   ├── flashcards/       # Flashcard UI
│   │   ├── landing/          # Landing page
│   │   └── ui/               # Radix UI components (shadcn/ui)
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── ai/               # AI provider abstraction
│   │   ├── auth/             # Auth helpers and access control
│   │   ├── embeddings/       # Text chunking and embedding generation
│   │   ├── file-processing/  # PDF/DOCX parsers
│   │   ├── flashcards/       # Flashcard generation logic
│   │   └── supabase/         # Supabase client utilities
│   ├── test/                 # Test utilities and setup
│   └── types/                # TypeScript type definitions
├── supabase/
│   ├── schema.sql            # Database schema
│   ├── storage-policies.sql  # Storage RLS policies
│   └── templates/            # Email templates
├── e2e/                      # Playwright end-to-end tests
└── scripts/                  # Build and utility scripts
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, testing practices, and code conventions.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint && npm run test:run`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [DigitalOcean Gradient](https://www.digitalocean.com/) and [HuggingFace](https://huggingface.co/)

---

<div align="center">

**[⬆ back to top](#-studium)**

Made with ❤️ for students everywhere

</div>
