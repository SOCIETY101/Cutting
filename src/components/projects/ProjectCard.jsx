import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Star, Copy, Trash2, Edit, Calendar } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { useState } from 'react'

export function ProjectCard({ project, onClick, onEdit, onDelete, onDuplicate }) {
  const { updateProject } = useProjects()
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()
    setTogglingFavorite(true)
    try {
      await updateProject(project.id, { isFavorite: !project.is_favorite })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setTogglingFavorite(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={togglingFavorite}
            className="ml-2"
          >
            <Star
              className={`h-4 w-4 ${
                project.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(project.updated_at)}
            </div>
            <div>
              {project.pieces?.length || 0} piece{project.pieces?.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Panel: {project.panel_width}×{project.panel_height}mm
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-muted rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
