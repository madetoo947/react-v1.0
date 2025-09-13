import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Получаем текущую сессию при первой загрузке приложения
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Если сессия есть, запрашиваем профиль
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            // Собираем полный объект пользователя с ролью
            const fullUser = {
              ...session.user,
              role: profile?.role || 'user',
            }
            setUser(fullUser)
            // И ТОЛЬКО ПОСЛЕ ЭТОГО завершаем загрузку
            setLoading(false)
          })
      } else {
        // ИЗМЕНЕНИЕ: Если сессии нет, мы должны сразу закончить загрузку!
        setLoading(false)
      }
    })

    // 2. Слушаем изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Пользователь вошел. Запрашиваем его профиль.
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const fullUser = {
          ...session.user,
          role: profile?.role || 'user',
        }
        setUser(fullUser)
      } else {
        // Пользователь вышел
        setUser(null)
      }
      // ИЗМЕНЕНИЕ: Завершаем загрузку в любом случае после изменения состояния
      setLoading(false)
    })

    // 3. Отписываемся от слушателя
    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    logout: () => supabase.auth.signOut(),
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
