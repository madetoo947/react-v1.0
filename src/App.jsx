import { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Layout, ConfigProvider, message, Grid, Row, Col } from 'antd'
import AppHeader from './components/AppHeader'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute' // 1. Импортируем наш новый компонент

const { Content } = Layout
const { useBreakpoint } = Grid

function AppContent() {
  const [activeTab, setActiveTab] = useState('na')
  const { user } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <Layout className="layout">
      {user && <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />}
      <Content style={{ padding: '16px 0' }}>
        <Row justify="center">
          <Col xs={23} sm={22} md={22} lg={20} xl={18}>
            <div
              className="site-layout-content"
              style={{
                padding: isMobile ? 12 : 24,
                borderRadius: isMobile ? 8 : 12,
              }}
            >
              {/* 2. Обновляем логику маршрутизации */}
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage activeTab={activeTab} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    user ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

export default function App() {
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FBBB12',
          colorBgLayout: '#141414',
          colorBgContainer: '#1f1f1f',
          colorBgElevated: '#2a2a2a',
          colorText: 'rgba(255, 255, 255, 0.85)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        },
        components: {
          message: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorBgElevated: '#3a3a3a',
            colorSuccess: '#4caf50',
            colorError: '#e42618',
            colorWarning: '#FBBB12',
          },
        },
      }}
    >
      {contextHolder}
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  )
}
