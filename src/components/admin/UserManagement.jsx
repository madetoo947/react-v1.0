// src/components/admin/UserManagement.jsx
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
  fetchUsersWithRoles,
  createUser,
  updateUserRole,
  deleteUser,
} from '../../api/usersApi'

const { Option } = Select

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchUsersWithRoles()
      setUsers(data)
    } catch (error) {
      message.error(`Ошибка загрузки пользователей: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleShowModal = (user = null) => {
    setEditingUser(user)
    if (user) {
      form.setFieldsValue({
        email: user.email,
        role: user.role,
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingUser(null)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingUser) {
        // Обновляем только роль
        await updateUserRole(editingUser.id, values.role)
        message.success('Роль пользователя обновлена')
      } else {
        // Создаем нового пользователя
        await createUser({
          email: values.email,
          password: values.password,
          role: values.role,
        })
        message.success('Пользователь создан. Ему отправлено письмо для подтверждения.')
      }

      setIsModalVisible(false)
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
          <Button type="link" onClick={() => handleShowModal(record)}>
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить этого пользователя?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
            placement="topRight"
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
        onClick={() => handleShowModal(null)}
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
        title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="userForm">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true }]}
            initialValue="user"
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