import { Spin } from 'antd'

export default function LoadingIndicator({ loading }) {
  if (!loading) return null

  return (
    <div id="loading-indicator">
      <Spin tip="Загрузка..."></Spin>
    </div>
  )
}
