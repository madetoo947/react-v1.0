import { useQuery } from '@tanstack/react-query'
import { fetchTabData } from '../api/dealerApi'

// 1. Принимаем объект user в качестве аргумента
export function useTabData(activeTab, selectedMonth, user) {
  return useQuery({
    queryKey: ['tabData', activeTab, selectedMonth.format('YYYY-MM')],
    queryFn: () => fetchTabData(activeTab, selectedMonth),

    // 2. Добавляем опцию `enabled`
    // Запрос будет выполнен только тогда, когда объект user существует (не null).
    // `!!user` превращает объект в true, а null - в false.
    enabled: !!user,

    refetchOnWindowFocus: false,
    keepPreviousData: true,
  })
}
