import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spin } from 'antd' // Импортируем спиннер для индикации загрузки

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // 1. Получаем не только user, но и КЛЮЧЕВОЕ состояние `loading`
  const { user, loading } = useAuth()

  // 2. Если идет первоначальная загрузка данных о пользователе, мы не принимаем никаких решений.
  //    Мы просто показываем индикатор загрузки и терпеливо ждем.
  //    ЭТО И ЕСТЬ КЛЮЧЕВОЙ ФИКС, который решает "гонку состояний".
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  // 3. Только после того, как загрузка завершена (loading === false), мы начинаем проверки.

  // Если пользователя нет, перенаправляем на страницу входа.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Если это роут только для админа, а роль пользователя не 'admin',
  // перенаправляем на дашборд.
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Если все проверки успешно пройдены, отображаем запрошенную страницу.
  return children
}

export default ProtectedRoute
