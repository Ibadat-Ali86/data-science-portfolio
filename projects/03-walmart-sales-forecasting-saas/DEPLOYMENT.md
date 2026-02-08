# Walmart Forecasting - Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your **Project URL** and **anon key** from Settings → API
4. Run the SQL migrations in the SQL Editor:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Copy contents of `supabase/migrations/002_rls_policies.sql`

### Step 2: Deploy ML Backend to Render
1. Go to [render.com](https://render.com) and create a free account
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Root Directory**: `ml-forecast-saas`
   - **Build Command**: Uses Dockerfile automatically
   - **Free tier**: Yes
5. Add environment variables:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app`

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and create a free account
2. Import your GitHub repository
3. Set **Root Directory**: `ml-forecast-saas/frontend`
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://walmart-ml-api.onrender.com`)
5. Deploy!

## 📦 Files Created for Deployment

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Database schema |
| `supabase/migrations/002_rls_policies.sql` | Row-Level Security |
| `frontend/src/lib/supabase.js` | Supabase client |
| `frontend/src/hooks/useSupabase.js` | React hooks |
| `frontend/vercel.json` | Vercel configuration |
| `frontend/.env.example` | Environment template |
| `render.yaml` | Render deployment config |
| `Dockerfile` | ML backend container |
| `backend/requirements-render.txt` | Optimized dependencies |

## ⚠️ Free Tier Limitations

| Service | Limitation | Workaround |
|---------|------------|------------|
| Render | 512MB RAM | Using lightweight XGBoost only |
| Render | 15min sleep | Cold start ~30s, add loading indicator |
| Supabase | 500MB DB | Limit historical data retention |
| Vercel | 100GB bandwidth | More than enough for most use cases |
