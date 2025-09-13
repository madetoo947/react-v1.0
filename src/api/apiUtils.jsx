import { supabase } from './supabaseClient'

/**
 * Универсальная обертка для выполнения запросов к Supabase.
 * Обрабатывает ошибки и возвращает данные или null.
 * @param {Promise} queryPromise - Промис запроса от Supabase (например, supabase.from(...).select(...))
 * @param {string} errorMessage - Сообщение об ошибке для вывода в консоль.
 * @returns {Promise<Array|null>} - Возвращает массив данных или null в случае ошибки.
 */
export async function handleSupabaseQuery(queryPromise, errorMessage) {
  try {
    const { data, error } = await queryPromise
    if (error) {
      throw error
    }
    return data || []
  } catch (error) {
    console.error(`${errorMessage}:`, error.message)
    // В реальном приложении здесь можно было бы подключить систему логирования ошибок
    return null // Возвращаем null, чтобы хук useQuery мог обработать это как ошибку
  }
}
