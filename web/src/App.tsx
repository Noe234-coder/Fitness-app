import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { RequireRole } from './auth/RequireRole'
import { AreaPlaceholder } from './pages/AreaPlaceholder'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/athlete"
            element={
              <RequireRole area="athlete">
                <AreaPlaceholder area="athlete" />
              </RequireRole>
            }
          />
          <Route
            path="/coach"
            element={
              <RequireRole area="coach">
                <AreaPlaceholder area="coach" />
              </RequireRole>
            }
          />
          {/* Anything else goes to /login, which forwards signed-in users to their home. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
