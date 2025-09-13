import { supabase } from './supabaseClient'
import bcrypt from 'bcryptjs'

export async function loginUser(email, password) {
  // Используем встроенный метод Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Supabase вернет user-friendly ошибку, например, "Invalid login credentials"
    throw error;
  }

  // Возвращаем данные сессии и пользователя
  return data;
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
