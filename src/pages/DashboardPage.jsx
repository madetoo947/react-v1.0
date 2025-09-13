import { useState } from 'react'
import { Tabs, Card, Space, Typography } from 'antd'
import DataFetcher from '../components/DataFetcher'
import { useAuth } from '../contexts/AuthContext'

const { TabPane } = Tabs
const { Title } = Typography

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('na')
  const { user } = useAuth()

  const tabItems = [
    { key: 'na', label: 'Новые авто' },
    { key: 'asp', label: 'Авто с пробегом' },
    { key: 'sts', label: 'СТС' },
    { key: 'mkc', label: 'МКЦ' },
    { key: 'balance', label: 'Баланс' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3}>Панель управления</Title>
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map((item) => ({
              ...item,
              children: <DataFetcher activeTab={item.key} />,
            }))}
          />
        </Card>
      </Space>
    </div>
  )
}
