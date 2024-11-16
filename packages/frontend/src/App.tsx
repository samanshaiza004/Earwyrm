import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EmailLogin } from '@components/molecules/EmailLogin'
import { ProtectedRoute } from '@components/atoms/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Home } from '@/pages/Home'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
