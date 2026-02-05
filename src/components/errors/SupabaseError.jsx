import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AlertCircle } from 'lucide-react'

export function SupabaseError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erreur de configuration
          </CardTitle>
          <CardDescription>Les identifiants Supabase sont manquants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pour utiliser cette application, vous devez configurer Supabase :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Créez un fichier <code className="bg-muted px-1 rounded">.env</code> à la racine du projet</li>
            <li>Ajoutez vos identifiants Supabase :
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </li>
            <li>Redémarrez le serveur de développement</li>
          </ol>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Voir <code className="bg-muted px-1 rounded">SETUP.md</code> pour des instructions détaillées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
