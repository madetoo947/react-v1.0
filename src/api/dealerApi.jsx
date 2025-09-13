import { supabase } from './supabaseClient'
import { handleSupabaseQuery } from './apiUtils' // Импортируем нашу новую утилиту

// Главная функция загрузки данных
export async function fetchTabData(tab, date) {
  switch (tab) {
    case 'na':
      return fetchNaData(date)
    case 'asp':
      return fetchAspData(date)
    case 'sts':
      return fetchServiceData('sts', date)
    case 'mkc':
      return fetchServiceData('mkc', date)
    case 'balance':
      const balanceData = await fetchBalanceData()
      return {
        current: balanceData,
        isBalance: true,
      }
    default:
      // Возвращаем Promise.reject, чтобы useQuery корректно обработал ошибку
      return Promise.reject(new Error(`Unknown tab: ${tab}`))
  }
}

// --- Функции для планов ---

async function fetchPlanData(date) {
  const query = supabase
    .from('operplan_sts_mkc_shc')
    .select('*')
    .gte('Дата', date.startOf('month').format('YYYY-MM-DD'))
    .lte('Дата', date.endOf('month').format('YYYY-MM-DD'))

  return handleSupabaseQuery(query, 'Ошибка загрузки планов СТС/МКЦ')
}

async function fetchNaPlanData(date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const query = supabase
    .from('operplan_na')
    .select('ДЦ, Марка, шт, ЖОК')
    .gte('Дата', start)
    .lte('Дата', end)

  const data = await handleSupabaseQuery(query, 'Ошибка загрузки планов НА')

  if (!data) return []

  // Группируем по ДЦ и суммируем показатели
  const groupedByDealer = data.reduce((acc, item) => {
    if (!acc[item.ДЦ]) {
      acc[item.ДЦ] = { ДЦ: item.ДЦ, шт: 0, ЖОК: 0 }
    }
    acc[item.ДЦ].шт += item.шт || 0
    acc[item.ДЦ].ЖОК += item.ЖОК || 0
    return acc
  }, {})

  return Object.values(groupedByDealer)
}

async function fetchAspPlanData(date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const query = supabase
    .from('operplan_asp')
    .select('ДЦ, шт, ЖОК')
    .gte('Дата', start)
    .lte('Дата', end)

  return handleSupabaseQuery(query, 'Ошибка загрузки планов АСП')
}

// --- Основные функции для получения данных ---

async function fetchNaData(date) {
  const [sales, plans] = await Promise.all([
    fetchSalesData(['Retail', 'Fleet'], date),
    fetchNaPlanData(date),
  ])

  return { ...sales, plans }
}

async function fetchAspData(date) {
  const [sales, plans] = await Promise.all([
    fetchSalesData(['Ам с пробегом'], date),
    fetchAspPlanData(date),
  ])

  return { ...sales, plans }
}

async function fetchServiceData(tab, date) {
  const tableName =
    tab === 'sts' ? 'ezhednevnaya_svodka_sts' : 'ezhednevnaya_svodka_mkc'

  const [current, previous, appg, plans] = await Promise.all([
    fetchServiceMonthData(tableName, date),
    fetchServiceMonthData(tableName, date.subtract(1, 'month')),
    fetchServiceMonthData(tableName, date.subtract(1, 'year')),
    fetchPlanData(date),
  ])

  return { current, previous, appg, plans }
}

async function fetchSalesData(categories, date) {
  const [current, previous, appg] = await Promise.all([
    fetchSalesDataForPeriod(categories, date),
    fetchSalesDataForPeriod(categories, date.subtract(1, 'month')),
    fetchSalesDataForPeriod(categories, date.subtract(1, 'year')),
  ])

  return { current, previous, appg }
}

async function fetchSalesDataForPeriod(categories, date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const query = supabase
    .from('vin_zhok')
    .select('ДЦ, Категория, ЖОК')
    .in('Категория', categories)
    .neq('Поставщик', 'ПЕТРОВСКИЙ СПБ')
    .neq('Поставщик', 'Петровский ООО')
    .neq('Поставщик', 'ПИКАРС ООО')
    .gte('Дата', start)
    .lte('Дата', end)

  return handleSupabaseQuery(
    query,
    `Ошибка загрузки продаж за ${date.format('YYYY-MM')}`
  )
}

async function fetchServiceMonthData(tableName, date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const query = supabase
    .from(tableName)
    .select('*')
    .gte('Дата', start)
    .lte('Дата', end)

  return handleSupabaseQuery(
    query,
    `Ошибка загрузки данных сервиса из ${tableName}`
  )
}

async function fetchBalanceData() {
  const query = supabase.from('balance').select('Активы, Значение')
  return handleSupabaseQuery(query, 'Ошибка загрузки баланса')
}
