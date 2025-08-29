import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'
import { loginUser, updateUserPassword } from '../api/authApi' // Добавляем импорт

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('supabase.auth.user')
    if (session) {
      setUser(JSON.parse(session))
    }
    setLoading(false)
  }, [])

  const login = async (userData) => {
    // Изменяем сигнатуру функции
    setUser(userData)
    localStorage.setItem('supabase.auth.user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('supabase.auth.user')
  }

  const updateProfile = async (updates) => {
    if (!user) return
    try {
      await updateUserPassword(user.id, updates.password_hash)
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('supabase.auth.user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading,
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
