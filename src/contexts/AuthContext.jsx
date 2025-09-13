import { createContext, useContext, useState, useEffect, useMemo } from 'react' // 1. Импортируем useMemo
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserProfile = async (user) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) throw error
        return { ...user, role: profile?.role || 'user' }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error)
        return null
      }
    }

    // Этап 1: Проверка сессии при первой загрузке
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const fullUser = await getUserProfile(session.user)
        setUser(fullUser)
      }
      setLoading(false)
    })

    // Этап 2: Слушаем изменения состояния в будущем
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const fullUser = await getUserProfile(session.user)
        setUser(fullUser)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 2. Мемоизируем значение контекста
  // Этот объект будет пересоздаваться ТОЛЬКО когда изменится `user`
  const value = useMemo(
    () => ({
      user,
      logout: () => supabase.auth.signOut(),
    }),
    [user]
  )

  // Пока идет самая первая проверка, ничего не показываем.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
