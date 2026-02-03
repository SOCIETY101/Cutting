# 2D Cutting Optimization App

A React application for optimizing 2D wood cutting using Guillotine-based MaxRects bin packing algorithm, with Supabase integration for project management.

## Features

- **Optimization Algorithm**: Bottom-Left Best Fit with vertical-first guillotine cuts
- **Project Management**: Save, edit, duplicate, and organize cutting projects
- **User Authentication**: Secure login/signup with Supabase Auth
- **Database Integration**: Full CRUD operations for projects and pieces
- **Multi-Panel Support**: Automatically creates multiple panels as needed
- **Waste Consolidation**: Groups waste in bottom-right corner for reuse
- **Machine-Friendly**: Optimized for real wood cutting machines

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase/schema.sql`
   - This creates the tables: `projects`, `pieces`, `optimization_results`
   - Sets up Row Level Security (RLS) policies
   - Creates necessary indexes

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login/Signup forms
│   ├── layout/        # Layout components
│   ├── projects/      # Project management components
│   └── ui/            # shadcn/ui components
├── hooks/
│   ├── useAuth.js     # Authentication hook
│   └── useProjects.js # Projects CRUD hook
├── lib/
│   └── supabase.js    # Supabase client
├── pages/
│   ├── Auth.jsx       # Authentication page
│   ├── Dashboard.jsx  # Projects list
│   ├── Optimizer.jsx  # Cutting optimization interface
│   └── ProjectDetail.jsx # Project detail/editor
└── optimizer.js       # Core optimization algorithm
```

## Database Schema

### Projects Table
- `id` (UUID)
- `user_id` (UUID, references auth.users)
- `name` (VARCHAR)
- `description` (TEXT)
- `panel_width` (INTEGER)
- `panel_height` (INTEGER)
- `min_waste_size` (INTEGER)
- `is_favorite` (BOOLEAN)
- `tags` (TEXT[])
- `created_at`, `updated_at` (TIMESTAMP)

### Pieces Table
- `id` (UUID)
- `project_id` (UUID, references projects)
- `piece_type_id` (INTEGER)
- `width`, `height` (INTEGER)
- `quantity` (INTEGER)
- `rotation_allowed` (BOOLEAN)
- `display_order` (INTEGER)

### Optimization Results Table
- `id` (UUID)
- `project_id` (UUID, references projects)
- `panel_count`, `total_used_area`, `total_waste_area` (DECIMAL)
- `used_percentage`, `waste_percentage` (DECIMAL)
- `result_data` (JSONB)
- `created_at` (TIMESTAMP)

## Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Create Project**: Click "New Project" to create a cutting project
3. **Configure**: Set panel dimensions and add pieces
4. **Optimize**: Click "Generate Optimization" to run the algorithm
5. **Save**: Save your project and optimization results
6. **Manage**: View, edit, duplicate, or delete projects from the dashboard

## Algorithm Details

- **Placement Strategy**: Bottom-Left Best Fit (prioritizes top-left positions)
- **Cut Strategy**: Vertical-first guillotine cuts (machine-friendly)
- **Waste Management**: Consolidates waste to bottom-right corner
- **Trash Threshold**: Discards waste smaller than configured size (default 100×100mm)
- **Rotation**: Auto-rotation enabled by default for better optimization

## Environment Variables

Required environment variables (create `.env` file):

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## License

MIT
