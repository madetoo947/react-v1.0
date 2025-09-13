import { Menu, Layout, Grid, Dropdown, Button, theme } from 'antd'
import { MenuOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../hooks/useUserProfile' // 1. Импортируем новый хук
import { useNavigate } from 'react-router-dom'

const { Header } = Layout
const { useBreakpoint } = Grid
const { useToken } = theme

const PetrovskyLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M31.04 0H0.96C0.429807 0 0 0.429807 0 0.96V31.04C0 31.5702 0.429807 32 0.96 32H31.04C31.5702 32 32 31.5702 32 31.04V0.96C32 0.429807 31.5702 0 31.04 0Z"
      fill="#FBBB12"
    />
    <path
      d="M21.4976 8H10.5024C8.83413 8 8 8.85333 8 10.56V23.68C8 23.7649 8.03371 23.8463 8.09373 23.9063C8.15374 23.9663 8.23513 24 8.32 24H11.84C11.9249 24 12.0063 23.9663 12.0663 23.9063C12.1263 23.8463 12.16 23.7649 12.16 23.68V12.3296C12.16 12.2447 12.1937 12.1633 12.2537 12.1033C12.3137 12.0433 12.3951 12.0096 12.48 12.0096H19.52C19.6049 12.0096 19.6863 12.0433 19.7463 12.1033C19.8063 12.1633 19.84 12.2447 19.84 12.3296V23.68C19.84 23.7649 19.8737 23.8463 19.9337 23.9063C19.9937 23.9663 20.0751 24 20.16 24H23.68C23.7649 24 23.8463 23.9663 23.9063 23.9063C23.9663 23.8463 24 23.7649 24 23.68V10.56C24 8.85333 23.1659 8 21.4976 8Z"
      fill="black"
    />
  </svg>
)

export default function AppHeader({ activeTab, setActiveTab }) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const { token } = useToken()
  const { user, logout } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(user) // 2. Получаем профиль
  const navigate = useNavigate()

  const menuItems = [
    {
      key: 'data',
      label: 'Анализ данных',
      onClick: () => {
        setActiveTab('na')
        navigate('/dashboard')
      },
    },
    // 3. Показываем админку, только если профиль загружен и роль - admin
    ...(!isProfileLoading && profile?.role === 'admin'
      ? [
          {
            key: 'admin',
            label: 'Администрирование',
            onClick: () => navigate('/admin'),
          },
        ]
      : []),
    {
      key: 'profile',
      label: 'Профиль',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Выйти',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Header
      style={{
        padding: isMobile ? '0 8px' : '0 24px',
        height: isMobile ? '56px' : '64px',
        lineHeight: isMobile ? '56px' : '64px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: token.colorBgContainer,
        boxShadow: token.boxShadow,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <PetrovskyLogo />
          <span
            style={{
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: isMobile ? '16px' : '18px',
              whiteSpace: 'nowrap',
            }}
          >
            Dashboard
          </span>
        </div>

        {isMobile ? (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={
                <MenuOutlined style={{ color: 'white', fontSize: '20px' }} />
              }
            />
          </Dropdown>
        ) : (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={menuItems}
            style={{
              minWidth: '120px',
              borderBottom: 'none',
              background: 'transparent',
              lineHeight: isMobile ? '56px' : '64px',
            }}
          />
        )}
      </div>
    </Header>
  )
}
