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
3. Copy the contents of `supabase/schema.sql` from the repository and run it
4. This creates all tables with proper RLS policies and vector support (384 dimensions for HuggingFace embeddings)

### 1.4 Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it `documents`
4. Uncheck "Public bucket" (keep it private)
5. Click **Create bucket**
6. Go to **SQL Editor** and run the contents of `supabase/storage-policies.sql`

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

## Step 2: DigitalOcean Gradient AI Platform Setup

DigitalOcean's Gradient AI Platform provides serverless inference for AI models. We'll use it for the chat functionality with Llama 3.3 70B.

### 2.1 Claim DigitalOcean Credits

1. Go to [GitHub Student Developer Pack](https://education.github.com/pack)
2. Find **DigitalOcean** and claim $200 credits

### 2.2 Access Gradient AI Platform

1. Go to [DigitalOcean Cloud Console](https://cloud.digitalocean.com)
2. In the left sidebar, click **Gradient AI Platform** (or search for "GenAI")
3. Navigate to the **Serverless Inference** tab

### 2.3 Create Model Access Key

1. In Serverless Inference, click **Create Access Key** or **Manage Keys**
2. Give your key a name: `studium-key`
3. Click **Create**
4. **Important**: Copy the key immediately - you won't be able to see it again!
5. Save this as your `DO_GRADIENT_API_KEY`

### 2.4 Available Models

The default model is `llama3.3-70b-instruct`. Other available models include:

- `llama3.3-70b-instruct` (recommended - best quality)
- `llama3.1-8b-instruct` (faster, lower cost)
- `mistral-nemo-instruct-2407`
- `deepseek-r1-distill-llama-70b`

You can change the model by setting `DO_GRADIENT_CHAT_MODEL` in your environment variables.

---

## Step 3: HuggingFace Setup (Embeddings)

HuggingFace provides free API access for generating embeddings used in semantic search.

### 3.1 Create HuggingFace Account

1. Go to [huggingface.co](https://huggingface.co) and sign up (free)

### 3.2 Create Access Token

1. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
2. Click **New token**
3. Give it a name: `studium`
4. Select **Read** permission (that's all we need)
5. Click **Create**
6. Copy the token - this is your `HUGGINGFACE_API_KEY`

### 3.3 Model Information

We use `sentence-transformers/all-MiniLM-L6-v2` for embeddings:

- **Dimensions**: 384 (configured in database schema)
- **Free tier**: Generous rate limits for personal projects
- **Speed**: Fast inference times

---

## Step 4: Deploy to DigitalOcean App Platform

### 4.1 Push Code to GitHub

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

### 4.2 Create DigitalOcean App

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Choose **GitHub** and authorize
4. Select your `studium` repository
5. Branch: `main`
6. Click **Next**

### 4.3 Configure Build Settings

1. Resource Type: **Web Service**
2. Build Command: `npm run build`
3. Run Command: `npm run start`
4. HTTP Port: `3000`
5. Instance Size: **Basic** ($5/month, covered by credits)

### 4.4 Add Environment Variables

Click **Edit** next to Environment Variables and add ALL of these:

| Variable                        | Value                                               |
| ------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Your app URL (e.g. http://localhost:3000)           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Your Supabase service role key                      |
| `DO_GRADIENT_API_KEY`           | Your DigitalOcean Gradient access key               |
| `DO_GRADIENT_CHAT_MODEL`        | `llama3.3-70b-instruct` (optional)                  |
| `HUGGINGFACE_API_KEY`           | Your HuggingFace access token                       |
| `HUGGINGFACE_EMBEDDING_MODEL`   | `sentence-transformers/all-MiniLM-L6-v2` (optional) |

Mark sensitive keys (`SUPABASE_SERVICE_ROLE_KEY`, `DO_GRADIENT_API_KEY`, `HUGGINGFACE_API_KEY`) as **Encrypted**.

### 4.5 Deploy

1. Click **Next** through remaining steps
2. Review and click **Create Resources**
3. Wait for deployment (~5 minutes)
4. You'll get a URL like `https://studium-xxxxx.ondigitalocean.app`

---

## Step 5: Update OAuth Redirect URLs

### 5.1 Update Supabase

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your DigitalOcean URL
3. Add to **Redirect URLs**:
   - `https://studium-xxxxx.ondigitalocean.app/auth/callback`

### 5.2 Update Google OAuth

1. Go to Google Cloud Console → **Credentials**
2. Edit your OAuth client
3. Add to **Authorized redirect URIs**:
   - Your Supabase callback URL (already added)
4. Add to **Authorized JavaScript origins**:
   - `https://studium-xxxxx.ondigitalocean.app`

---

## Step 6: Custom Domain (Optional)

### 6.1 Claim .TECH Domain

1. Go to [GitHub Student Developer Pack](https://education.github.com/pack)
2. Find **.TECH Domains** and claim a free domain
3. Register `studium.tech` (or similar)

### 6.2 Configure DNS

1. In your .TECH domain dashboard, add DNS records:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `studium-xxxxx.ondigitalocean.app`

2. In DigitalOcean:
   - Go to your app → **Settings** → **Domains**
   - Add your custom domain
   - DigitalOcean will auto-provision SSL

### 6.3 Update URLs Again

Update Supabase and Google OAuth with your custom domain:

- Site URL: `https://studium.tech`
- Redirect: `https://studium.tech/auth/callback`

---

## Step 7: Verify Deployment

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

- Check HuggingFace API key is set correctly
- Verify the model `sentence-transformers/all-MiniLM-L6-v2` is accessible
- Check DigitalOcean App logs for embedding errors

### Chat not responding

- Check DO Gradient API key is set correctly
- Verify the key has access to serverless inference
- Check DigitalOcean App logs for API errors

### Rate limit errors from HuggingFace

- HuggingFace free tier has generous limits but can throttle during high usage
- Wait a few minutes and try again
- Consider upgrading to HuggingFace Pro for higher limits

### Build fails on DigitalOcean

- Check all environment variables are set
- View build logs for specific errors

---

## Cost Summary (with Student Pack)

| Service                   | Free Tier / Credits                              |
| ------------------------- | ------------------------------------------------ |
| Supabase                  | Free tier (500MB database, 1GB storage)          |
| DigitalOcean App Platform | $200 credits (40 months at $5/mo)                |
| DigitalOcean Gradient AI  | Pay-per-use from $200 credits (~$0.65/1M tokens) |
| HuggingFace               | Free tier (generous rate limits)                 |
| .TECH Domain              | 1 year free                                      |

**Total cost: $0** for the first year!

---

## API Pricing Reference

### DigitalOcean Gradient AI (Serverless Inference)

| Model                  | Input (per 1M tokens) | Output (per 1M tokens) |
| ---------------------- | --------------------- | ---------------------- |
| Llama 3.3 70B Instruct | $0.35                 | $0.65                  |
| Llama 3.1 8B Instruct  | $0.04                 | $0.07                  |

### HuggingFace Inference API

- **Free tier**: Rate-limited but sufficient for personal projects
- **Pro tier**: $9/month for higher rate limits if needed

---

## Next Steps

1. Add more unit tests
2. Set up monitoring (DigitalOcean has built-in metrics)
3. Add more AI features (quiz generation, study scheduling)
4. Share your project link in your portfolio!

Congratulations! Your AI Study Buddy is now live!
