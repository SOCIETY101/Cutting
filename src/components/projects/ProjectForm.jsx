import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { X } from 'lucide-react'

export function ProjectForm({ project, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [panelWidth, setPanelWidth] = useState(1000)
  const [panelHeight, setPanelHeight] = useState(1000)
  const [minWasteSize, setMinWasteSize] = useState(100)
  const [poignetEnabled, setPoignetEnabled] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setDescription(project.description || '')
      setPanelWidth(project.panel_width || 1000)
      setPanelHeight(project.panel_height || 1000)
      setMinWasteSize(project.min_waste_size || 100)
      setPoignetEnabled(project.poignet_enabled || false)
    }
  }, [project])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      name,
      description,
      panelWidth,
      panelHeight,
      minWasteSize,
      poignetEnabled,
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{project ? 'Modifier le projet' : 'Nouveau projet'}</CardTitle>
        <CardDescription>
          {project ? 'Mettre à jour les paramètres du projet' : 'Créer un nouveau projet de découpe'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nom du projet *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. : Armoires de cuisine"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle..."
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panel-width">Largeur du panneau (mm) *</Label>
              <Input
                id="panel-width"
                type="number"
                min="1"
                value={panelWidth}
                onChange={(e) => setPanelWidth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panel-height">Hauteur du panneau (mm) *</Label>
              <Input
                id="panel-height"
                type="number"
                min="1"
                value={panelHeight}
                onChange={(e) => setPanelHeight(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-waste-size">Taille minimale des chutes (mm)</Label>
            <Input
              id="min-waste-size"
              type="number"
              min="0"
              value={minWasteSize}
              onChange={(e) => setMinWasteSize(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Les chutes plus petites que cette taille seront ignorées
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="poignet-enabled-form"
              checked={poignetEnabled}
              onChange={(e) => setPoignetEnabled(e.target.checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="poignet-enabled-form" className="text-sm font-medium cursor-pointer">
                Mode Poignet
              </Label>
              <p className="text-xs text-muted-foreground">
                Les pièces seront placées uniquement en haut ou en bas (les bords de largeur s'alignent avec les bords du panneau)
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {project ? 'Mettre à jour le projet' : 'Créer le projet'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
