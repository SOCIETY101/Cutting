# Quick Setup Guide

## ⚠️ You're seeing this because the database tables don't exist yet!

### Fix in 3 Steps:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** → **New Query**

2. **Copy & Paste Schema**
   - Open `supabase/schema.sql` file in this project
   - Copy **ALL** the contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **Run** button (or Cmd/Ctrl + Enter)

3. **Refresh This Page**
   - Come back here and refresh (F5 or Cmd+R)

That's it! The app will work after this.

---

## What Gets Created:

✅ `projects` table - Stores your cutting projects  
✅ `pieces` table - Stores piece definitions  
✅ `optimization_results` table - Stores optimization history  
✅ Security policies - Ensures data privacy  
✅ Indexes - Makes queries fast  

---

## Still Having Issues?

Check:
- ✅ Supabase project is active (not paused)
- ✅ You're logged into Supabase dashboard
- ✅ SQL ran without errors (check for green success message)
- ✅ Tables appear in **Table Editor** sidebar

Need help? Check `DATABASE_SETUP.md` for detailed troubleshooting.
