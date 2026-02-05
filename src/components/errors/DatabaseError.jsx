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
            Configuration de la base de données requise
          </CardTitle>
          <CardDescription>
            Les tables de la base de données doivent être créées avant de pouvoir utiliser cette application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Étapes de configuration rapide :</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Allez sur le tableau de bord de votre projet Supabase</li>
              <li>Cliquez sur <strong>Éditeur SQL</strong> dans la barre latérale gauche</li>
              <li>Cliquez sur <strong>Nouvelle requête</strong></li>
              <li>Ouvrez le fichier <code className="bg-background px-1 rounded">supabase/schema.sql</code> de ce projet</li>
              <li>Copiez le <strong>contenu entier</strong> et collez-le dans l'éditeur SQL</li>
              <li>Cliquez sur <strong>Exécuter</strong> (ou appuyez sur Cmd/Ctrl + Entrée)</li>
              <li>Actualisez cette page</li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Le schéma créera :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>La table <code className="bg-muted px-1 rounded">projects</code></li>
              <li>La table <code className="bg-muted px-1 rounded">pieces</code></li>
              <li>La table <code className="bg-muted px-1 rounded">optimization_results</code></li>
              <li>Les politiques de sécurité au niveau des lignes</li>
              <li>Les index pour les performances</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir le tableau de bord Supabase
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Actualiser la page
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Voir <code className="bg-muted px-1 rounded">DATABASE_SETUP.md</code> pour des instructions détaillées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
