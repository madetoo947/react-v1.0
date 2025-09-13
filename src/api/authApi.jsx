import { supabase } from './supabaseClient'

export async function loginUser(email, password) {
  // Используем встроенный метод Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Supabase вернет user-friendly ошибку, например, "Invalid login credentials"
    throw error
  }

  // Возвращаем данные сессии и пользователя
  return data
}

// Новая, правильная функция для обновления пароля пользователя.
// Она использует встроенный и безопасный метод Supabase.
export async function updateUserPassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    // Передаем более детальное сообщение об ошибке от Supabase
    throw new Error(`Ошибка при обновлении пароля: ${error.message}`)
  }
  return data
}
