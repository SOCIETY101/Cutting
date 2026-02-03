import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useProjects } from '../../hooks/useProjects'
import { Plus, Search, Star, Copy, Trash2, Edit, Calendar } from 'lucide-react'
import { ProjectCard } from './ProjectCard'

export function ProjectList({ onSelectProject, onCreateProject, onEditProject }) {
  const { projects, loading, deleteProject, duplicateProject } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFavorite, setFilterFavorite] = useState(false)

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFavorite = !filterFavorite || project.is_favorite
    return matchesSearch && matchesFavorite
  })

  const handleDelete = async (projectId, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId)
      } catch (error) {
        alert('Failed to delete project: ' + error.message)
      }
    }
  }

  const handleDuplicate = async (projectId, e) => {
    e.stopPropagation()
    try {
      await duplicateProject(projectId)
    } catch (error) {
      alert('Failed to duplicate project: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={filterFavorite ? 'default' : 'outline'}
          onClick={() => setFilterFavorite(!filterFavorite)}
        >
          <Star className={`h-4 w-4 mr-2 ${filterFavorite ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {projects.length === 0
                ? 'No projects yet. Create your first project to get started!'
                : 'No projects match your search'}
            </p>
            {projects.length === 0 && (
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
              onEdit={(e) => {
                e.stopPropagation()
                onEditProject(project.id)
              }}
              onDelete={(e) => handleDelete(project.id, e)}
              onDuplicate={(e) => handleDuplicate(project.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
