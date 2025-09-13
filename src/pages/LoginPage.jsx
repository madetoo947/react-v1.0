import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Card, Typography, message } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { loginUser } from '../api/authApi' 

const { Title } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Теперь loginUser возвращает { user, session }
      await loginUser(values.email, values.password);
      message.success('Вход выполнен успешно');
      navigate('/dashboard'); // onAuthStateChange подхватит сессию и обновит состояние
    } catch (error) {
      message.error(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          Вход в систему
        </Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Пожалуйста, введите email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
