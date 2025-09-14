import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Состояние загрузки теперь ключевое

  useEffect(() => {
    const getUserProfile = async (sessionUser) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single()

        if (error) throw error
        // Возвращаем ПОЛНОСТЬЮ сформированный объект пользователя
        return { ...sessionUser, role: profile?.role || 'user' }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error)
        return { ...sessionUser, role: 'user' }
      }
    }

    const processSession = async (session) => {
      if (session) {
        const fullUser = await getUserProfile(session.user)
        setUser(fullUser)
      } else {
        setUser(null)
      }
      // Завершаем загрузку только ПОСЛЕ всех асинхронных операций
      setLoading(false)
    }

    // onAuthStateChange - наш единый источник правды.
    // Он срабатывает один раз при загрузке с INITIAL_SESSION, а затем при логине/логауте.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      processSession(session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Мемоизируем значение, чтобы передавать и user, и loading
  const value = useMemo(
    () => ({
      user,
      loading, // Экспортируем loading наружу
      logout: () => supabase.auth.signOut(),
    }),
    [user, loading]
  )

  // Мы больше не прячем children за !loading здесь.
  // Эту логику теперь будет выполнять ProtectedRoute.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
