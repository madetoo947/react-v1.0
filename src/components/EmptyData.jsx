import { Empty, Typography } from 'antd'

export default function EmptyData() {
  return (
    <Empty description={<Typography.Text>Нет данных</Typography.Text>}></Empty>
  )
}
