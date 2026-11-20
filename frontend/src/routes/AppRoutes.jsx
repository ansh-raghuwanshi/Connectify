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

function RootRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '16px',
          background: 'var(--bg-page)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)',
            animation: 'pulseGlow 2s infinite ease-in-out',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
          Loading Connectify...
        </p>
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
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
