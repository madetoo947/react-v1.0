import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
} from 'antd'
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../api/usersApi'
import bcrypt from 'bcryptjs'

const { Option } = Select

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      message.error(`Ошибка загрузки пользователей: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (currentUser) {
        // Если это обновление и пароль не меняли - не хешируем
        const updates = values.password
          ? { ...values, password_hash: await bcrypt.hash(values.password, 10) }
          : values
        delete updates.password // Удаляем plain text пароль

        await updateUser(currentUser.id, updates)
        message.success('Пользователь обновлен')
      } else {
        // Создание нового пользователя
        await createUser(values.email, values.password, values.role)
        message.success('Пользователь создан')
      }

      setModalVisible(false)
      loadUsers()
    } catch (error) {
      message.error(`Ошибка: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId)
      message.success('Пользователь удален')
      loadUsers()
    } catch (error) {
      message.error(`Ошибка удаления: ${error.message}`)
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 'admin' ? 'Администратор' : 'Пользователь'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button
            type="link"
            onClick={() => {
              setCurrentUser(record)
              form.setFieldsValue({
                email: record.email,
                role: record.role,
                password: '', // Не показываем текущий пароль
              })
              setModalVisible(true)
            }}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить пользователя?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger>
              Удалить
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setCurrentUser(null)
          form.resetFields()
          setModalVisible(true)
        }}
        style={{ marginBottom: 16 }}
      >
        Добавить пользователя
      </Button>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'
        }
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Введите корректный email',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              {
                required: !currentUser,
                message: 'Введите пароль',
              },
              {
                min: 8,
                message: 'Пароль должен содержать минимум 8 символов',
              },
            ]}
          >
            <Input.Password
              placeholder={
                currentUser ? 'Оставьте пустым, чтобы не менять' : ''
              }
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select>
              <Option value="admin">Администратор</Option>
              <Option value="user">Пользователь</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
