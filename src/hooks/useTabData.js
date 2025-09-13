import { useQuery } from '@tanstack/react-query';
import { fetchTabData } from '../api/dealerApi';

export function useTabData(activeTab, selectedMonth) {
  return useQuery({
    // Ключ запроса: React Query будет кэшировать данные по этому ключу
    queryKey: ['tabData', activeTab, selectedMonth.format('YYYY-MM')],
    // Функция, которая выполняет запрос
    queryFn: () => fetchTabData(activeTab, selectedMonth),
    // Не делать повторный запрос при фокусе окна, если не нужно
    refetchOnWindowFocus: false,
    // Сохранять предыдущие данные при загрузке новых
    keepPreviousData: true,
  });
}