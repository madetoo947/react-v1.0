import { useState } from 'react'
import { Tabs } from 'antd'
import UserManagement from '../components/admin/UserManagement'
import DataTables from '../components/admin/DataTables'
import { useAuth } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary' // 1. Импортируем наш предохранитель

export default function AdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  if (user?.role !== 'admin') {
    return <div>Доступ запрещен</div>
  }

  const tabItems = [
    {
      key: 'users',
      label: 'Управление пользователями',
      children: <UserManagement />,
    },
    {
      key: 'data',
      label: 'Редактирование данных',
      children: <DataTables />,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* 2. Оборачиваем компонент Tabs в ErrorBoundary */}
      <ErrorBoundary>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </ErrorBoundary>
    </div>
  )
}
