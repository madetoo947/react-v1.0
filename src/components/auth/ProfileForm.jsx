import { useState } from 'react'
import { Form, Input, Button, message, Card } from 'antd'
import { updateUserPassword } from '../../api/authApi' // Импортируем нашу новую API функцию

export default function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Пароли не совпадают')
      return
    }

    try {
      setLoading(true)
      // Используем нашу новую, правильную функцию из authApi
      await updateUserPassword(values.newPassword)
      message.success('Пароль успешно изменен')
      form.resetFields()
    } catch (error) {
      // Ошибка уже будет содержать детальное сообщение от API
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Изменение пароля" style={{ maxWidth: 500, margin: '0 auto' }}>
      <Form form={form} name="profile" onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Новый пароль"
          name="newPassword"
          rules={[{ required: true, message: 'Введите новый пароль' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Подтвердите пароль"
          name="confirmPassword"
          rules={[{ required: true, message: 'Подтвердите новый пароль' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Сохранить изменения
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
