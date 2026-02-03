# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `cutting-optimizer` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 3. Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Create Environment File

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from step 3.

### 5. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This creates:
- `projects` table
- `pieces` table  
- `optimization_results` table
- Row Level Security policies
- Indexes for performance

### 6. Run the Application

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 7. Create Your First Account

1. Click "Sign Up"
2. Enter your email and password (min 6 characters)
3. Check your email for verification link
4. Click the verification link
5. Sign in with your credentials

### 8. Create Your First Project

1. Click "New Project" or go to `/project/new`
2. Configure panel dimensions and pieces
3. Click "Save Project" to save
4. Click "Generate Optimization" to run the algorithm

## Troubleshooting

### "Supabase URL and Anon Key must be set"
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart the dev server after creating `.env`

### "Failed to sign in" / "Failed to create account"
- Check your Supabase project is active
- Verify credentials in `.env` are correct
- Check Supabase dashboard for any errors

### Database errors
- Make sure you ran `schema.sql` in SQL Editor
- Check that RLS policies are enabled
- Verify tables exist in Database → Tables

### Projects not loading
- Check browser console for errors
- Verify you're logged in (check user email in nav bar)
- Check Supabase logs in dashboard

## Next Steps

- Customize panel sizes for your common materials
- Create project templates for repeated jobs
- Export optimization results for your cutting machine
- Organize projects with tags and favorites

## Support

For issues:
1. Check browser console for errors
2. Check Supabase dashboard → Logs
3. Verify database schema is correct
4. Ensure RLS policies are active
