import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { EmailLogin } from '@components/molecules/EmailLogin'
import { ProtectedRoute } from '@components/atoms/ProtectedRoute'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProfileMenu } from '@/components/molecules/ProfileMenu'
import { Home } from '@/pages/Home'
import { Profile } from '@/pages/Profile'

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
  const { user, logout } = useAuth()
  
  return (
    <>
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
      <main>
        <Routes>
          <Route path="/login" element={<EmailLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
