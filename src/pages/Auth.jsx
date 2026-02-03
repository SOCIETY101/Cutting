import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignUpForm } from '../components/auth/SignUpForm'
import { useNavigate } from 'react-router-dom'

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {isLogin ? (
        <LoginForm
          onSwitchToSignUp={() => setIsLogin(false)}
          onSuccess={handleSuccess}
        />
      ) : (
        <SignUpForm
          onSwitchToLogin={() => setIsLogin(true)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
