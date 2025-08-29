import { useState, useEffect } from 'react'
import { Table, Select, Button, message } from 'antd'
import { supabase } from '../../api/supabaseClient'

export default function DataTables() {
  const [messageApi, contextHolder] = message.useMessage() // Правильное использование message
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTables = async () => {
    setLoading(true)
    try {
      // Вариант 1: Используем RPC
      const { data, error } = await supabase.rpc('get_table_names')

      if (error) throw error
      setTables(data.map((item) => item.table_name || item))
    } catch (error) {
      messageApi.error('Ошибка загрузки списка таблиц')
      console.error('Fetch tables error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  return (
    <>
      {contextHolder}
      <Select
        style={{ width: 300, marginBottom: 16 }}
        placeholder="Выберите таблицу"
        loading={loading}
        options={tables.map((table) => ({
          label: table,
          value: table,
        }))}
      />
    </>
  )
}
