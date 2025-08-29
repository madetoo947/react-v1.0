import { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Layout, ConfigProvider, message, Grid } from 'antd'
import AppHeader from './components/AppHeader'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'

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
      <Content
        style={{
          padding: isMobile ? '14px 8px' : '24px 50px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <div
          className="site-layout-content"
          style={{
            padding: isMobile ? 12 : 24,
            borderRadius: isMobile ? 8 : 12,
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <DashboardPage activeTab={activeTab} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                user?.role === 'admin' ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route
              path="/"
              element={
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </Content>
    </Layout>
  )
}

export default function App() {
  message.config({
    maxCount: 3,
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FBBB12',
          colorBgContainer: '#1a1a1a',
          colorBgLayout: '#1a1a1a',
          colorText: '#f0f0f0',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
          colorBorder: '#444',
          colorBorderSecondary: '#444',
          colorFillAlter: '#252525',
          colorBgElevated: '#252525',
          colorError: '#e42618',
          colorWarning: '#FBBB12',
          colorSuccess: '#4caf50',
          colorInfo: '#FBBB12',
          borderRadius: 6,
          fontSize: 14,
          sizeStep: 4,
          sizeUnit: 4,
        },
        components: {
          Layout: {
            headerBg: '#2d2d2d',
            bodyBg: '#1a1a1a',
            footerBg: '#2d2d2d',
            headerHeight: 64,
            headerPadding: '0 24px',
          },
          Card: {
            colorBgContainer: '#252525',
            colorBorderSecondary: '#444',
            borderRadius: 12,
            borderRadiusLG: 12,
            padding: 24,
            paddingLG: 24,
          },
          Table: {
            colorBgContainer: '#252525',
            colorBorderSecondary: '#444',
            headerBg: '#2d2d2d',
            headerColor: '#f0f0f0',
            rowHoverBg: '#3a3a3a',
            fontSize: 14,
            padding: 16,
            paddingContentVertical: 12,
          },
          Statistic: {
            titleColor: 'rgba(255, 255, 255, 0.65)',
            contentColor: '#f0f0f0',
            fontSize: 24,
          },
          Button: {
            paddingInline: 16,
            paddingBlock: 8,
            fontSize: 14,
            borderRadius: 6,
            controlHeight: 36,
          },
          Input: {
            paddingBlock: 8,
            paddingInline: 12,
            controlHeight: 36,
          },
        },
      }}
    >
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  )
}
