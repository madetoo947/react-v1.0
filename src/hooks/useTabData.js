import { useQuery } from '@tanstack/react-query'
import { fetchTabData } from '../api/dealerApi'

// 1. Принимаем объект user в качестве аргумента
export function useTabData(activeTab, selectedMonth, user) {
  return useQuery({
    queryKey: ['tabData', activeTab, selectedMonth.format('YYYY-MM')],
    queryFn: () => fetchTabData(activeTab, selectedMonth),

    enabled: !!user,

    refetchOnWindowFocus: false,
    keepPreviousData: true,
  })
}
