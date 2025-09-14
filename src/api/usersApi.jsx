import { supabase } from './supabaseClient'
import { handleSupabaseQuery } from './apiUtils.jsx'

// Получение всех пользователей с их ролями
export async function fetchUsersWithRoles() {
  try {
    // Этап 1: Получаем пользователей напрямую, чтобы проверить ответ
    const { data: usersData, error: invokeError } =
      await supabase.functions.invoke('manage-users', { method: 'GET' })

    // Ошибка на уровне вызова функции (например, нет прав доступа к функции)
    if (invokeError) {
      throw invokeError
    }

    // Ошибка, которую вернула сама функция в своем теле
    if (usersData && usersData.error) {
      throw new Error(usersData.error)
    }

    // Проверяем, что данные действительно являются массивом
    if (!Array.isArray(usersData)) {
      console.error('Ответ от Edge Function не является массивом:', usersData)
      return [] // Возвращаем пустой массив, чтобы избежать сбоя
    }

    // Этап 2: Получаем профили
    const profiles = await handleSupabaseQuery(
      supabase.from('profiles').select('id, role'),
      'Ошибка получения профилей пользователей'
    )

    // Если профили не загрузились, это не критично, вернем пользователей без ролей
    if (!profiles) {
      return usersData.map((user) => ({ ...user, role: 'user' }))
    }

    // Этап 3: Объединяем данные
    const profilesMap = new Map(profiles.map((p) => [p.id, p.role]))
    const usersWithRoles = usersData.map((user) => ({
      ...user,
      role: profilesMap.get(user.id) || 'user',
    }))

    return usersWithRoles
  } catch (error) {
    console.error('Критическая ошибка в fetchUsersWithRoles:', error.message)
    return [] // Гарантируем возврат массива в случае любой ошибки
  }
}

// Создание нового пользователя
export async function createUser(userData) {
  return handleSupabaseQuery(
    supabase.functions.invoke('manage-users', {
      method: 'POST',
      body: userData, // { email, password, role }
    }),
    'Ошибка при создании пользователя'
  )
}

// Обновление роли пользователя
export async function updateUserRole(userId, role) {
  return handleSupabaseQuery(
    supabase.functions.invoke('manage-users', {
      method: 'PATCH',
      body: { userId, role },
    }),
    'Ошибка при обновлении роли'
  )
}

// Удаление пользователя
export async function deleteUser(userId) {
  return handleSupabaseQuery(
    supabase.functions.invoke('manage-users', {
      method: 'DELETE',
      body: { userId },
    }),
    'Ошибка при удалении пользователя'
  )
}
