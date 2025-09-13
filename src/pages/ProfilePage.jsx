import { Card, Typography, Button, Space, Spin } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile' // 1. Импортируем хук профиля
import ProfileForm from '../components/auth/ProfileForm'

const { Text } = Typography

export default function ProfilePage() {
  const { user, logout } = useAuth()
  // 2. Получаем профиль и статус его загрузки
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(user)

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
              {/* 3. Показываем Spin пока роль загружается, затем отображаем ее */}
              {isProfileLoading ? (
                <Spin size="small" />
              ) : profile?.role === 'admin' ? (
                'Администратор'
              ) : (
                'Пользователь'
              )}
            </Text>
            <Button type="primary" onClick={logout} danger>
              Выйти
            </Button>
          </Space>
        </Card>

        <ProfileForm />
      </Space>
    </div>
  )
}
