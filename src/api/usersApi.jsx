import { supabase } from './supabaseClient'

export async function fetchUsersWithRoles() {
  // Вызываем функцию для получения списка пользователей из auth.users
  const { data: users, error: usersError } = await supabase.functions.invoke('manage-users', {
    method: 'GET',
  })
  if (usersError) throw usersError

  // Получаем все профили, чтобы сопоставить роли (это безопасно, RLS для админа разрешит)
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*')
  if (profilesError) throw profilesError

  // Создаем карту профилей для быстрого поиска
  const profilesMap = new Map(profiles.map(p => [p.id, p]))

  // Объединяем пользователей с их ролями
  const usersWithRoles = users.map(user => ({
    ...user,
    role: profilesMap.get(user.id)?.role || 'user', // Роль по умолчанию 'user'
  }))

  return usersWithRoles
}

export async function createUser(userData) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    method: 'POST',
    body: userData, // { email, password, role }
  })
  if (error) throw error
  return data
}

export async function updateUserRole(userId, role) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    method: 'PATCH',
    body: { userId, role },
  })
  if (error) throw error
  return data
}

export async function deleteUser(userId) {
  const { data, error } = await supabase.functions.invoke('manage-users', {
    method: 'DELETE',
    body: { userId },
  })
  if (error) throw error
  return data
}