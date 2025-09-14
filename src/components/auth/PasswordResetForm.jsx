import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import { resetPassword } from '../../api/authApi'

export default function PasswordResetForm() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const onFinish = async (values) => {
    try {
      setLoading(true)
      await resetPassword(values.email)
      message.success('Инструкции по сбросу пароля отправлены на email')
      setEmailSent(true)
    } catch (error) {
      message.error(error.message || 'Ошибка сброса пароля')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>Проверьте вашу почту для завершения сброса пароля</p>
      </div>
    )
  }

  return (
    <Form name="reset-password" onFinish={onFinish} autoComplete="off">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Пожалуйста, введите email' },
          { type: 'email', message: 'Введите корректный email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Сбросить пароль
        </Button>
      </Form.Item>
    </Form>
  )
}
