import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, Home, FolderOpen, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Optimiseur de découpe</h1>
              <div className="flex gap-2">
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  onClick={() => navigate('/dashboard')}
                  size="sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Button>
                <Button
                  variant={location.pathname.startsWith('/project') ? 'default' : 'ghost'}
                  onClick={() => navigate('/project/new')}
                  size="sm"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Nouveau projet
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut} size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
