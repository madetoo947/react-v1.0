import { supabase } from './supabaseClient'
import bcrypt from 'bcryptjs'

export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return data
}

export async function createUser(email, password, role = 'user') {
  // 1. Хешируем пароль
  const saltRounds = 10
  const password_hash = await bcrypt.hash(password, saltRounds)

  // 2. Отправляем запрос
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password_hash, // Важно: поле должно называться как в таблице
        role,
      },
    ])
    .select() // Возвращаем созданного пользователя

  if (error) {
    console.error('Supabase error:', error)
    throw error
  }

  return data[0]
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteUser(userId) {
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw error
}
