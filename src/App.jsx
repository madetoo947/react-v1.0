import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, message, Grid, Row, Col } from 'antd'; // Убедись, что message импортирован
import AppHeader from './components/AppHeader';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { Content } = Layout;
const { useBreakpoint } = Grid;

function AppContent() {
  const [activeTab, setActiveTab] = useState('na');
  const { user } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default function App() {
  // --- ШАГ 1: Создаем экземпляр message API и contextHolder ---
  const [messageApi, contextHolder] = message.useMessage();

  // Настройка message.config больше не нужна, все будет браться из темы
  // message.config({ maxCount: 3 });

  return (
    <ConfigProvider
      theme={{
        token: {
          // ... твои токены ...
          colorPrimary: '#FBBB12',
          colorBgLayout: '#141414',
          colorBgContainer: '#1f1f1f',
          colorBgElevated: '#2a2a2a',
          colorText: 'rgba(255, 255, 255, 0.85)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
          // ... остальные токены ...
        },
        components: {
          // ... твои компоненты ...
          message: {
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorBgElevated: '#3a3a3a', // Фон уведомления
            // Можно добавить и другие токены, например, для иконок
            colorSuccess: '#4caf50',
            colorError: '#e42618',
            colorWarning: '#FBBB12',
          },
        },
      }}
    >
      {/* --- ШАГ 2: Рендерим contextHolder где-нибудь в приложении --- */}
      {contextHolder}
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}