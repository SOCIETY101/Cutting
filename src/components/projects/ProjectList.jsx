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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(projectId)
      } catch (error) {
        alert('Échec de la suppression du projet : ' + error.message)
      }
    }
  }

  const handleDuplicate = async (projectId, e) => {
    e.stopPropagation()
    try {
      await duplicateProject(projectId)
    } catch (error) {
      alert('Échec de la duplication du projet : ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement des projets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes projets</h2>
          <p className="text-muted-foreground">
            {projects.length} projet{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des projets..."
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
          Favoris
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {projects.length === 0
                ? 'Aucun projet pour le moment. Créez votre premier projet pour commencer !'
                : 'Aucun projet ne correspond à votre recherche'}
            </p>
            {projects.length === 0 && (
              <Button onClick={onCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un projet
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
