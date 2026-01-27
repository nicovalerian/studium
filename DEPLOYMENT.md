# Studium Deployment Guide

This guide walks you through deploying Studium to production using free-tier services from the GitHub Student Developer Pack.

## Prerequisites

- GitHub account (with Student Developer Pack for free credits)
- Google account (for OAuth setup)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **New Project**
3. Fill in:
   - **Name**: `studium`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **Create new project** (takes ~2 minutes)

### 1.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to a notepad:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 1.3 Set Up Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New query**
3. Paste and run this SQL:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Classes table
create table classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  display_name text,
  file_path text not null,
  content text,
  embedding_status text default 'pending' check (embedding_status in ('pending', 'processing', 'completed', 'failed')),
  embedding_version integer default 0,
  created_at timestamptz default now()
);

-- Document chunks with embeddings
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Flashcards table
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  created_at timestamptz default now()
);

-- Messages table (chat history)
create table messages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Create indexes
create index on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on documents (class_id);
create index on documents (user_id);
create index on flashcards (class_id);
create index on messages (class_id);

-- Enable Row Level Security
alter table classes enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table flashcards enable row level security;
alter table messages enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can CRUD their own classes"
  on classes for all using (auth.uid() = user_id);

create policy "Users can CRUD their own documents"
  on documents for all using (auth.uid() = user_id);

create policy "Users can access chunks of their documents"
  on document_chunks for all using (
    document_id in (select id from documents where user_id = auth.uid())
  );

create policy "Users can CRUD their own flashcards"
  on flashcards for all using (auth.uid() = user_id);

create policy "Users can CRUD their own messages"
  on messages for all using (auth.uid() = user_id);
```

### 1.4 Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it `documents`
4. Uncheck "Public bucket" (keep it private)
5. Click **Create bucket**
6. Click on the bucket, then **Policies**
7. Add these policies:

**Policy 1 - Upload:**

- Policy name: `Users can upload to their folder`
- Allowed operation: `INSERT`
- Policy definition: `(auth.uid())::text = (storage.foldername(name))[1]`

**Policy 2 - Read:**

- Policy name: `Users can read their files`
- Allowed operation: `SELECT`
- Policy definition: `(auth.uid())::text = (storage.foldername(name))[1]`

### 1.5 Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External**
   - Fill in app name: `Studium`
   - Add your email as support email
   - Add authorized domains (add later after deployment)
   - Save
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Studium Web`
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - (Get your exact URL from Supabase → Authentication → Providers → Google)
5. Copy the **Client ID** and **Client Secret**

6. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste Client ID and Client Secret
   - Save

7. Go to **Authentication** → **URL Configuration**
   - Add Site URL: `http://localhost:3000` (for now, update after deployment)
   - Add Redirect URLs:
     - `http://localhost:3000/auth/callback`

---

## Step 2: Azure OpenAI Setup (GitHub Student Pack)

### 2.1 Claim Azure Credits

1. Go to [GitHub Student Developer Pack](https://education.github.com/pack)
2. Find **Microsoft Azure** and click to claim
3. You'll get $100 in Azure credits

### 2.2 Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **Azure OpenAI** and click **Create**
3. Fill in:
   - Subscription: Your student subscription
   - Resource group: Create new → `studium-rg`
   - Region: `East US` (has best model availability)
   - Name: `studium-openai`
   - Pricing tier: `Standard S0`
4. Click **Review + create** → **Create**
5. Wait for deployment (~2 minutes)

### 2.3 Deploy Embedding Model

1. Go to your Azure OpenAI resource
2. Click **Go to Azure OpenAI Studio**
3. Click **Deployments** → **Create new deployment**
4. Select:
   - Model: `text-embedding-3-small`
   - Deployment name: `text-embedding-3-small`
   - Deployment type: Standard
5. Click **Create**

### 2.4 Get API Keys

1. In Azure Portal, go to your OpenAI resource
2. Click **Keys and Endpoint**
3. Copy:
   - `KEY 1` → This is your `AZURE_OPENAI_API_KEY`
   - `Endpoint` → This is your `AZURE_OPENAI_ENDPOINT`
4. Your `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` is `text-embedding-3-small`

---

## Step 3: Groq API Setup (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Sign in
3. Go to **API Keys** → **Create API Key**
4. Name it `studium`
5. Copy the key → This is your `GROQ_API_KEY`

---

## Step 4: Google Gemini API Setup (Free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → **Create API key**
3. Select a project or create new
4. Copy the key → This is your `GOOGLE_GENERATIVE_AI_API_KEY`

---

## Step 5: Deploy to DigitalOcean App Platform

### 5.1 Claim DigitalOcean Credits

1. Go to [GitHub Student Developer Pack](https://education.github.com/pack)
2. Find **DigitalOcean** and claim $200 credits

### 5.2 Push Code to GitHub

```bash
cd C:\Users\nico\Documents\Studium

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Studium MVP"

# Create GitHub repo and push
# Go to github.com/new, create "studium" repo
git remote add origin https://github.com/YOUR_USERNAME/studium.git
git branch -M main
git push -u origin main
```

### 5.3 Create DigitalOcean App

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Choose **GitHub** and authorize
4. Select your `studium` repository
5. Branch: `main`
6. Click **Next**

### 5.4 Configure Build Settings

1. Resource Type: **Web Service**
2. Build Command: `npm run build`
3. Run Command: `npm run start`
4. HTTP Port: `3000`
5. Instance Size: **Basic** ($5/month, covered by credits)

### 5.5 Add Environment Variables

Click **Edit** next to Environment Variables and add ALL of these:

| Variable                            | Value                      |
| ----------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | Your Supabase project URL  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Your Supabase anon key     |
| `AZURE_OPENAI_API_KEY`              | Your Azure OpenAI key      |
| `AZURE_OPENAI_ENDPOINT`             | Your Azure OpenAI endpoint |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | `text-embedding-3-small`   |
| `GROQ_API_KEY`                      | Your Groq API key          |
| `GOOGLE_GENERATIVE_AI_API_KEY`      | Your Gemini API key        |

Mark sensitive keys as **Encrypted**.

### 5.6 Deploy

1. Click **Next** through remaining steps
2. Review and click **Create Resources**
3. Wait for deployment (~5 minutes)
4. You'll get a URL like `https://studium-xxxxx.ondigitalocean.app`

---

## Step 6: Update OAuth Redirect URLs

### 6.1 Update Supabase

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your DigitalOcean URL
3. Add to **Redirect URLs**:
   - `https://studium-xxxxx.ondigitalocean.app/auth/callback`

### 6.2 Update Google OAuth

1. Go to Google Cloud Console → **Credentials**
2. Edit your OAuth client
3. Add to **Authorized redirect URIs**:
   - Your Supabase callback URL (already added)
4. Add to **Authorized JavaScript origins**:
   - `https://studium-xxxxx.ondigitalocean.app`

---

## Step 7: Custom Domain (Optional)

### 7.1 Claim .TECH Domain

1. Go to [GitHub Student Developer Pack](https://education.github.com/pack)
2. Find **.TECH Domains** and claim a free domain
3. Register `studium.tech` (or similar)

### 7.2 Configure DNS

1. In your .TECH domain dashboard, add DNS records:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `studium-xxxxx.ondigitalocean.app`

2. In DigitalOcean:
   - Go to your app → **Settings** → **Domains**
   - Add your custom domain
   - DigitalOcean will auto-provision SSL

### 7.3 Update URLs Again

Update Supabase and Google OAuth with your custom domain:

- Site URL: `https://studium.tech`
- Redirect: `https://studium.tech/auth/callback`

---

## Step 8: Verify Deployment

### Checklist

- [ ] Visit your app URL
- [ ] Landing page loads correctly
- [ ] Click "Get Started" → redirects to login
- [ ] Sign in with Google works
- [ ] Dashboard loads
- [ ] Upload a PDF document
- [ ] Document shows "Processing..." then "Ready"
- [ ] Chat about the document works
- [ ] Generate flashcards works
- [ ] Study mode works (flip cards, navigate)
- [ ] Sign out works

---

## Troubleshooting

### "Invalid redirect URI" on Google login

- Make sure Supabase callback URL is added to Google OAuth authorized redirects
- Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Documents stuck in "Processing"

- Check Azure OpenAI credentials
- Verify embedding deployment name matches exactly

### Chat not responding

- Check Groq API key is valid
- Check Gemini API key as fallback

### Build fails on DigitalOcean

- Check all environment variables are set
- View build logs for specific errors

---

## Cost Summary (with Student Pack)

| Service      | Free Tier / Credits                        |
| ------------ | ------------------------------------------ |
| Supabase     | Free tier (500MB database, 1GB storage)    |
| Azure OpenAI | $100 credits (lasts months for embeddings) |
| Groq         | Free tier (generous rate limits)           |
| Gemini       | Free tier (generous rate limits)           |
| DigitalOcean | $200 credits (40 months at $5/mo)          |
| .TECH Domain | 1 year free                                |

**Total cost: $0** for the first year!

---

## Next Steps

1. Add more unit tests
2. Set up monitoring (DigitalOcean has built-in metrics)
3. Add more AI features (quiz generation, study scheduling)
4. Share your project link in your portfolio!

Congratulations! Your AI Study Buddy is now live! 🎉
