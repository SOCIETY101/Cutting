-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  panel_width INTEGER NOT NULL DEFAULT 1000,
  panel_height INTEGER NOT NULL DEFAULT 1000,
  min_waste_size INTEGER NOT NULL DEFAULT 100,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Pieces table
CREATE TABLE IF NOT EXISTS pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  piece_type_id INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rotation_allowed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Optimization results table (optional - for saving optimization history)
CREATE TABLE IF NOT EXISTS optimization_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  panel_count INTEGER NOT NULL,
  total_used_area DECIMAL NOT NULL,
  total_waste_area DECIMAL NOT NULL,
  used_percentage DECIMAL NOT NULL,
  waste_percentage DECIMAL NOT NULL,
  usable_waste_area DECIMAL DEFAULT 0,
  result_data JSONB, -- Store full optimization result for visualization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_favorite ON projects(is_favorite);
CREATE INDEX IF NOT EXISTS idx_pieces_project_id ON pieces(project_id);
CREATE INDEX IF NOT EXISTS idx_optimization_results_project_id ON optimization_results(project_id);
CREATE INDEX IF NOT EXISTS idx_optimization_results_created_at ON optimization_results(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pieces
CREATE POLICY "Users can view pieces of their projects"
  ON pieces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pieces.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pieces to their projects"
  ON pieces FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pieces.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pieces of their projects"
  ON pieces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pieces.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pieces of their projects"
  ON pieces FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pieces.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for optimization_results
CREATE POLICY "Users can view results of their projects"
  ON optimization_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = optimization_results.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results to their projects"
  ON optimization_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = optimization_results.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete results of their projects"
  ON optimization_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = optimization_results.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
