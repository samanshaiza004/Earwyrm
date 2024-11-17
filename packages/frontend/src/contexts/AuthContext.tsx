import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@prisma/client'
import { userService } from '@/services/user.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      
      if (!token || !username) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Update auth headers for the current session
      if (token) {
        userService.headers = {
          ...userService.headers,
          'Authorization': `Bearer ${token}`
        }
      }

      // Fetch user profile
      const userProfile = await userService.getUserByUsername(username)
      setUser(userProfile)
    } catch (error) {
      console.error('Failed to check auth status:', error)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
