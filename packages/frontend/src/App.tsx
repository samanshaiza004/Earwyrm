import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { EmailLogin } from '@components/molecules/EmailLogin'
import { ProtectedRoute } from '@components/atoms/ProtectedRoute'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProfileMenu } from '@/components/molecules/ProfileMenu'
import { Home } from '@/pages/Home'
import { Profile } from '@/pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <>
      {isAuthenticated && (
        <header
          role="banner"
          aria-label="Main navigation"
          className="fixed top-0 left-0 right-0 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50"
        >
          <nav role="navigation" className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              <Link
                to="/"
                className="focus:ring-2 focus:ring-primary focus:outline-none rounded-md"
                aria-label="Go to homepage"
              >
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Earwyrm</h1>
                </div>
              </Link>
              <div className="flex gap-4 items-center">
                <ProfileMenu />
              </div>
            </div>
          </nav>
        </header>
      )}
      <main className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <EmailLogin />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App
