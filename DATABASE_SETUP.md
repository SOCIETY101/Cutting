# Database Setup Instructions

## Quick Setup

The database tables need to be created in your Supabase project. Follow these steps:

### Step 1: Open SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema

1. Open the file `supabase/schema.sql` in this project
2. **Copy the ENTIRE contents** of that file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see three tables:
   - `projects`
   - `pieces`
   - `optimization_results`

### Step 4: Verify RLS Policies

1. Go to **Authentication** → **Policies** in Supabase
2. You should see policies for all three tables
3. Each table should have policies for SELECT, INSERT, UPDATE, DELETE

## Troubleshooting

### Error: "Could not find the table 'public.projects'"
- **Solution**: The schema hasn't been run yet. Follow Step 2 above.

### Error: "permission denied for table projects"
- **Solution**: RLS policies weren't created. Re-run the entire schema.sql file.

### Error: "relation already exists"
- **Solution**: Tables already exist. You can either:
  - Drop existing tables and re-run schema.sql, OR
  - Continue using existing tables (if they have the correct structure)

### How to Drop and Recreate Tables (if needed)

⚠️ **WARNING**: This will delete all existing data!

Run this in SQL Editor before running schema.sql:

```sql
DROP TABLE IF EXISTS optimization_results CASCADE;
DROP TABLE IF EXISTS pieces CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
```

Then run the full `schema.sql` file.

## What the Schema Creates

1. **projects** - Stores cutting project configurations
2. **pieces** - Stores piece definitions for each project
3. **optimization_results** - Stores optimization run results
4. **Row Level Security (RLS)** - Ensures users can only access their own data
5. **Indexes** - Improves query performance
6. **Triggers** - Auto-updates `updated_at` timestamp

## Need Help?

If you're still having issues:
1. Check the Supabase dashboard → Logs for detailed error messages
2. Verify your project is active (not paused)
3. Make sure you're running the SQL as the project owner/admin
