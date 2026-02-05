import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { Optimizer } from './Optimizer'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { fetchProject, updateProject, createProject, saveOptimizationResult } = useProjects()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      loadProject()
    } else {
      setProject(null)
      setLoading(false)
    }
  }, [projectId])

  const loadProject = async () => {
    setLoading(true)
    const loadedProject = await fetchProject(projectId)
    if (loadedProject) {
      setProject(loadedProject)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const handleSaveProject = async (projectData) => {
    try {
      if (projectId === 'new') {
        // Create new project
        const name = prompt('Entrez le nom du projet :') || 'Projet sans titre'
        const newProject = await createProject({
          name,
          ...projectData,
        })
        navigate(`/project/${newProject.id}`)
      } else {
        await updateProject(projectId, projectData)
        await loadProject()
      }
    } catch (error) {
      alert('Échec de la sauvegarde du projet : ' + error.message)
    }
  }

  const handleSaveResult = async (result) => {
    if (projectId && projectId !== 'new') {
      try {
        await saveOptimizationResult(projectId, result)
      } catch (error) {
        console.error('Failed to save optimization result:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement du projet...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        {project && (
          <h2 className="text-2xl font-bold">{project.name}</h2>
        )}
      </div>
      <Optimizer
        project={project}
        onSaveProject={handleSaveProject}
        onSaveResult={handleSaveResult}
      />
    </div>
  )
}
