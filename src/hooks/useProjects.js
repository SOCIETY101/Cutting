import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all projects for the current user
  const fetchProjects = async () => {
    if (!user) {
      setProjects([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      // Fetch pieces for each project
      const projectsWithPieces = await Promise.all(
        (data || []).map(async (project) => {
          const { data: pieces } = await supabase
            .from('pieces')
            .select('*')
            .eq('project_id', project.id)
            .order('display_order', { ascending: true })

          return {
            ...project,
            pieces: pieces || [],
          }
        })
      )

      setProjects(projectsWithPieces)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching projects:', err)
      
      // Check if it's a table not found error
      if (err.code === 'PGRST205' || err.message?.includes('schema cache')) {
        console.error('⚠️ Database tables not found! Please run the schema.sql file in Supabase SQL Editor.')
        setError('Database tables not found. Please set up the database schema first.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch a single project with pieces
  const fetchProject = async (projectId) => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError) throw projectError

      const { data: pieces, error: piecesError } = await supabase
        .from('pieces')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })

      if (piecesError) throw piecesError

      return {
        ...project,
        pieces: pieces || [],
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create a new project
  const createProject = async (projectData) => {
    if (!user) {
      throw new Error('User must be logged in')
    }

    setLoading(true)
    setError(null)

    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name || 'Untitled Project',
          description: projectData.description || '',
          panel_width: projectData.panelWidth || 1000,
          panel_height: projectData.panelHeight || 1000,
          min_waste_size: projectData.minWasteSize || 100,
          tags: projectData.tags || [],
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Insert pieces if provided
      if (projectData.pieces && projectData.pieces.length > 0) {
        const piecesToInsert = projectData.pieces.map((piece, index) => ({
          project_id: project.id,
          piece_type_id: piece.id,
          width: piece.width,
          height: piece.height,
          quantity: piece.quantity,
          rotation_allowed: piece.rotationAllowed !== false,
          display_order: index,
        }))

        const { error: piecesError } = await supabase
          .from('pieces')
          .insert(piecesToInsert)

        if (piecesError) throw piecesError
      }

      await fetchProjects()
      return project
    } catch (err) {
      setError(err.message)
      console.error('Error creating project:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update a project
  const updateProject = async (projectId, updates) => {
    if (!user) {
      throw new Error('User must be logged in')
    }

    setLoading(true)
    setError(null)

    try {
      const projectUpdates = {}
      if (updates.name !== undefined) projectUpdates.name = updates.name
      if (updates.description !== undefined) projectUpdates.description = updates.description
      if (updates.panelWidth !== undefined) projectUpdates.panel_width = updates.panelWidth
      if (updates.panelHeight !== undefined) projectUpdates.panel_height = updates.panelHeight
      if (updates.minWasteSize !== undefined) projectUpdates.min_waste_size = updates.minWasteSize
      if (updates.isFavorite !== undefined) projectUpdates.is_favorite = updates.isFavorite
      if (updates.tags !== undefined) projectUpdates.tags = updates.tags

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(projectUpdates)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update pieces if provided
      if (updates.pieces !== undefined) {
        // Delete existing pieces
        await supabase.from('pieces').delete().eq('project_id', projectId)

        // Insert new pieces
        if (updates.pieces.length > 0) {
          const piecesToInsert = updates.pieces.map((piece, index) => ({
            project_id: projectId,
            piece_type_id: piece.id,
            width: piece.width,
            height: piece.height,
            quantity: piece.quantity,
            rotation_allowed: piece.rotationAllowed !== false,
            display_order: index,
          }))

          const { error: piecesError } = await supabase
            .from('pieces')
            .insert(piecesToInsert)

          if (piecesError) throw piecesError
        }
      }

      await fetchProjects()
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating project:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete a project
  const deleteProject = async (projectId) => {
    if (!user) {
      throw new Error('User must be logged in')
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      await fetchProjects()
    } catch (err) {
      setError(err.message)
      console.error('Error deleting project:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Duplicate a project
  const duplicateProject = async (projectId, newName) => {
    const project = await fetchProject(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    return await createProject({
      name: newName || `${project.name} (Copy)`,
      description: project.description,
      panelWidth: project.panel_width,
      panelHeight: project.panel_height,
      minWasteSize: project.min_waste_size,
      tags: project.tags,
      pieces: project.pieces.map((p) => ({
        id: p.piece_type_id,
        width: p.width,
        height: p.height,
        quantity: p.quantity,
        rotationAllowed: p.rotation_allowed,
      })),
    })
  }

  // Save optimization result
  const saveOptimizationResult = async (projectId, result) => {
    if (!user) {
      throw new Error('User must be logged in')
    }

    try {
      const { data, error } = await supabase
        .from('optimization_results')
        .insert({
          project_id: projectId,
          panel_count: result.stats.panelCount,
          total_used_area: result.stats.totalUsedArea,
          total_waste_area: result.stats.totalWasteArea,
          used_percentage: result.stats.usedPercentage,
          waste_percentage: result.stats.wastePercentage,
          usable_waste_area: result.stats.usableWasteArea || 0,
          result_data: result,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error saving optimization result:', err)
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchProjects()
    } else {
      setProjects([])
    }
  }, [user])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    saveOptimizationResult,
  }
}
