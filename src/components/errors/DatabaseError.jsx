import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Database, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'

export function DatabaseError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Database className="h-5 w-5" />
            Database Setup Required
          </CardTitle>
          <CardDescription>
            The database tables need to be created before you can use this app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Quick Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your Supabase project dashboard</li>
              <li>Click on <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Click <strong>New Query</strong></li>
              <li>Open the file <code className="bg-background px-1 rounded">supabase/schema.sql</code> from this project</li>
              <li>Copy the <strong>entire contents</strong> and paste into SQL Editor</li>
              <li>Click <strong>Run</strong> (or press Cmd/Ctrl + Enter)</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              The schema will create:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">projects</code> table</li>
              <li><code className="bg-muted px-1 rounded">pieces</code> table</li>
              <li><code className="bg-muted px-1 rounded">optimization_results</code> table</li>
              <li>Row Level Security policies</li>
              <li>Indexes for performance</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              See <code className="bg-muted px-1 rounded">DATABASE_SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
