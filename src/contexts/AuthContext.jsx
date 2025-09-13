import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('[AuthProvider] > Рендер компонента.', { loading, user })

  useEffect(() => {
    console.log('[AuthProvider] > useEffect запущен.')

    const getUserProfile = async (sessionUser) => {
      console.log(
        `[AuthProvider] > getUserProfile: Начинаем запрос профиля для ${sessionUser.id}`
      )
      try {
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single()

        // Добавляем таймаут, чтобы выявить зависание
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error('Таймаут! Запрос профиля занял больше 10 секунд.')
              ),
            10000
          )
        )

        const { data: profile, error } = await Promise.race([
          profilePromise,
          timeoutPromise,
        ])

        console.log(
          '[AuthProvider] > getUserProfile: Запрос профиля ЗАВЕРШЕН.',
          { profile, error }
        )

        if (error) {
          throw error
        }

        const fullUser = { ...sessionUser, role: profile?.role || 'user' }
        console.log(
          '[AuthProvider] > getUserProfile: Профиль успешно обработан.',
          { fullUser }
        )
        return fullUser
      } catch (error) {
        console.error('Ошибка внутри getUserProfile:', error)
        return { ...sessionUser, role: 'user' } // Возвращаем пользователя с ролью по умолчанию в случае ошибки
      }
    }

    const fetchSession = async () => {
      console.log('[AuthProvider] > fetchSession: Начало проверки сессии.')
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        if (session) {
          const fullUser = await getUserProfile(session.user)
          setUser(fullUser)
        }
      } catch (error) {
        console.error('Ошибка при восстановлении сессии:', error)
      } finally {
        console.log(
          '[AuthProvider] > fetchSession: ЗАВЕРШЕНИЕ загрузки, setLoading(false).'
        )
        setLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] > onAuthStateChange: Сработало событие.', {
        _event,
        session,
      })
      if (session) {
        const fullUser = await getUserProfile(session.user)
        setUser(fullUser)
      } else {
        setUser(null)
      }
    })

    return () => {
      console.log(
        '[AuthProvider] > useEffect cleanup: Отписка от onAuthStateChange.'
      )
      subscription?.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      logout: () => supabase.auth.signOut(),
    }),
    [user]
  )

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
