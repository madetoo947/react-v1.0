import { Card, Typography, Button, Space } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import ProfileForm from '../components/auth/ProfileForm' // 1. Импортируем нашу форму

const { Title, Text } = Typography // Используем Text для консистентности

export default function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Card title="Информация о пользователе">
          <Space direction="vertical" size="middle">
            <Text>
              <strong>Email:</strong> {user.email}
            </Text>
            <Text>
              <strong>Роль:</strong>{' '}
              {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </Text>
            <Button type="primary" onClick={logout} danger>
              Выйти
            </Button>
          </Space>
        </Card>

        {/* 2. Добавляем компонент формы смены пароля */}
        <ProfileForm />
      </Space>
    </div>
  )
}
