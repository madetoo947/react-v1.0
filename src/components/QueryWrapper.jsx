import React from 'react'
import { Spin, Result, Empty } from 'antd'

const QueryWrapper = ({ queryResult, children }) => {
  const { isLoading, isError, error, data } = queryResult

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 0',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <Result
        status="warning"
        title="Не удалось загрузить данные"
        subTitle={error.message || 'Произошла непредвиденная ошибка'}
      />
    )
  }

  // Проверяем, что данные вообще существуют, перед тем как рендерить children.
  if (!data) {
    return <Empty description="Нет данных для отображения" />
  }

  // Вызываем children как функцию и передаем ей данные.
  // Это гарантирует, что компонент, использующий данные, получит их только тогда, когда они готовы.
  return children(data)
}

export default QueryWrapper
