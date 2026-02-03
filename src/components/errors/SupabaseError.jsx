import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AlertCircle } from 'lucide-react'

export function SupabaseError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Configuration Error
          </CardTitle>
          <CardDescription>Supabase credentials are missing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To use this application, you need to configure Supabase:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a <code className="bg-muted px-1 rounded">.env</code> file in the project root</li>
            <li>Add your Supabase credentials:
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </li>
            <li>Restart the dev server</li>
          </ol>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              See <code className="bg-muted px-1 rounded">SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
