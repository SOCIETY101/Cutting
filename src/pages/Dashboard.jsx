import { ProjectList } from '../components/projects/ProjectList'
import { DatabaseError } from '../components/errors/DatabaseError'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'

export function Dashboard() {
  const navigate = useNavigate()
  const { error } = useProjects()

  const handleCreateProject = () => {
    navigate('/project/new')
  }

  const handleEditProject = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  const handleSelectProject = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  // Show database error if tables don't exist
  if (error && (error.includes('schema cache') || error.includes('Database tables not found'))) {
    return <DatabaseError />
  }

  return (
    <div className="container mx-auto p-6">
      <ProjectList
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
      />
    </div>
  )
}
