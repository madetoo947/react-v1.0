import { useState } from 'react'
import { Tabs, Spin } from 'antd' // Заменяем message на Spin для индикации загрузки
import UserManagement from '../components/admin/UserManagement'
import DataTables from '../components/admin/DataTables'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile' // 1. Импортируем хук профиля

const { TabPane } = Tabs

export default function AdminPage() {
  const { user } = useAuth()
  // 2. Получаем профиль и статус его загрузки
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(user)
  const [activeTab, setActiveTab] = useState('users')

  // 3. Показываем индикатор загрузки, пока профиль не получен
  if (isProfileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  // 4. Проверяем доступ на основе загруженного профиля
  if (!profile || profile.role !== 'admin') {
    return <div>Доступ запрещен</div>
  }

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Управление пользователями" key="users">
          <UserManagement />
        </TabPane>
        <TabPane tab="Редактирование данных" key="data">
          <DataTables />
        </TabPane>
      </Tabs>
    </div>
  )
}
