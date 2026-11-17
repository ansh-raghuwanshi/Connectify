import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Landing from '../pages/Landing'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import VerifyEmail from '../pages/VerifyEmail'
import Alumni from '../pages/Alumni'
import Profile from '../pages/Profile'
import Events from '../pages/Events'
import Mentorship from '../pages/Mentorship'
import Messages from '../pages/Messages'
import AiAssistant from '../pages/AiAssistant'
import NotFound from '../pages/NotFound'

import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Navbar from '../components/layout/Navbar'

// Root route dispatcher: if logged in -> /home, else -> landing page
function RootRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Connectify...</p>
      </div>
    )
  }
  return isAuthenticated ? (
    <Navigate to="/home" replace />
  ) : (
    <div>
      <Navbar />
      <Landing />
    </div>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Protected application routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Alumni />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentorship"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Mentorship />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Events />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Messages />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AiAssistant />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Unknown Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
