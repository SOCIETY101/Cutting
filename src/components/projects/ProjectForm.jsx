import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { X } from 'lucide-react'

export function ProjectForm({ project, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [panelWidth, setPanelWidth] = useState(1000)
  const [panelHeight, setPanelHeight] = useState(1000)
  const [minWasteSize, setMinWasteSize] = useState(100)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setDescription(project.description || '')
      setPanelWidth(project.panel_width || 1000)
      setPanelHeight(project.panel_height || 1000)
      setMinWasteSize(project.min_waste_size || 100)
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
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{project ? 'Edit Project' : 'New Project'}</CardTitle>
        <CardDescription>
          {project ? 'Update project settings' : 'Create a new cutting project'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen Cabinets"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panel-width">Panel Width (mm) *</Label>
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
              <Label htmlFor="panel-height">Panel Height (mm) *</Label>
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
            <Label htmlFor="min-waste-size">Minimum Waste Size (mm)</Label>
            <Input
              id="min-waste-size"
              type="number"
              min="0"
              value={minWasteSize}
              onChange={(e) => setMinWasteSize(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Waste smaller than this size will be discarded
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {project ? 'Update Project' : 'Create Project'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
