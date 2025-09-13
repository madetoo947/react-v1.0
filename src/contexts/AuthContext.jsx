import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange теперь просто устанавливает пользователя из Supabase Auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading, // Добавим loading, чтобы компоненты могли его использовать
      logout: () => supabase.auth.signOut(),
    }),
    [user, loading]
  )

  // Мы по-прежнему не показываем приложение, пока не будет получен первоначальный статус сессии
  if (loading) {
    return null // или <LoadingIndicator fullscreen />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
