import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabaseClient'

async function fetchUserProfile(userId) {
  if (!userId) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Ошибка при загрузке профиля пользователя:', error)
    // Возвращаем роль по умолчанию в случае ошибки, чтобы избежать сбоев
    return { role: 'user' }
  }

  return profile
}

export function useUserProfile(user) {
  const userId = user?.id

  return useQuery({
    // Ключ запроса зависит от ID пользователя
    queryKey: ['userProfile', userId],
    // Функция запроса
    queryFn: () => fetchUserProfile(userId),
    // Запрос будет активен только если есть userId
    enabled: !!userId,
    // Настройки кэширования и поведения
    staleTime: 5 * 60 * 1000, // Кэшировать профиль на 5 минут
    refetchOnWindowFocus: false,
  })
}
