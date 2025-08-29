import { Card, Typography, Button } from 'antd'
import { useAuth } from '../contexts/AuthContext'

const { Title } = Typography

export default function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div style={{ padding: 24 }}>
      <Card title="Профиль пользователя">
        <Title level={4}>Email: {user.email}</Title>
        <p>Роль: {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
        <Button type="primary" onClick={() => logout()} danger>
          Выйти
        </Button>
      </Card>
    </div>
  )
}
