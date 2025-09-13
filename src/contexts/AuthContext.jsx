import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Получаем текущую сессию при первой загрузке приложения
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Если сессия есть, сразу запрашиваем профиль
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        // Собираем полный объект пользователя с ролью
        const fullUser = {
          ...session.user,
          role: profile?.role || 'user', // Если профиля нет, даем роль 'user' по умолчанию
        };
        setUser(fullUser);
      }
      setLoading(false);
    });

    // 2. Слушаем изменения состояния аутентификации (вход, выход, обновление токена)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          // Пользователь вошел в систему. Запрашиваем его профиль.
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // Собираем полный объект пользователя и сохраняем в состоянии
          const fullUser = {
            ...session.user,
            role: profile?.role || 'user',
          };
          setUser(fullUser);
        } else {
          // Пользователь вышел из системы
          setUser(null);
        }
        setLoading(false);
      }
    );

    // 3. Отписываемся от слушателя при размонтировании компонента
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    logout: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}