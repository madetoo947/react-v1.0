import { supabase } from './supabaseClient'
import bcrypt from 'bcryptjs'

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw error
    if (!data) throw new Error('Пользователь не найден')

    // Безопасное сравнение хеша пароля
    console.log(data.password_hash)
    const isPasswordValid = await bcrypt.compare(password, data.password_hash)

    if (!isPasswordValid) {
      throw new Error('Неверный пароль')
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
export async function updateUserPassword(userId, newPassword) {
  const { error } = await supabase
    .from('users')
    .update({ password_hash: newPassword })
    .eq('id', userId)

  if (error) {
    throw new Error('Ошибка при обновлении пароля')
  }
}
