import { supabase } from './supabaseClient'

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
      return {
        current: await fetchBalanceData(),
        isBalance: true,
      }
    default:
      throw new Error(`Unknown tab: ${tab}`)
  }
}

// Функция для загрузки планов СТС/МКЦ
export async function fetchPlanData(date) {
  const { data, error } = await supabase
    .from('operplan_sts_mkc_shc')
    .select('*')
    .gte('Дата', date.startOf('month').format('YYYY-MM-DD'))
    .lte('Дата', date.endOf('month').format('YYYY-MM-DD'))

  if (error) {
    console.error('Error fetching STS/MKC plan data:', error)
    return []
  }
  return data
}

// Функция для загрузки планов НА (суммируем по маркам)
async function fetchNaPlanData(date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('operplan_na')
    .select('ДЦ, Марка, шт, ЖОК')
    .gte('Дата', start)
    .lte('Дата', end)

  if (error) {
    console.error('Error fetching NA plan data:', error)
    return []
  }

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

// Функция для загрузки планов АСП
async function fetchAspPlanData(date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('operplan_asp')
    .select('ДЦ, шт, ЖОК')
    .gte('Дата', start)
    .lte('Дата', end)

  if (error) {
    console.error('Error fetching ASP plan data:', error)
    return []
  }

  return data
}

// Загрузка данных для новых авто (НА)
async function fetchNaData(date) {
  const [sales, plans] = await Promise.all([
    fetchSalesData(['Retail', 'Fleet'], date),
    fetchNaPlanData(date),
  ])

  return {
    current: sales.current,
    previous: sales.previous,
    appg: sales.appg,
    plans: plans,
  }
}

// Загрузка данных для авто с пробегом (АСП)
async function fetchAspData(date) {
  const [sales, plans] = await Promise.all([
    fetchSalesData(['Ам с пробегом'], date),
    fetchAspPlanData(date),
  ])

  return {
    current: sales.current,
    previous: sales.previous,
    appg: sales.appg,
    plans: plans,
  }
}

// Загрузка данных для сервисов (СТС/МКЦ)
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

// Загрузка данных по продажам
async function fetchSalesData(categories, date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const { data: current, error: currentError } = await supabase
    .from('vin_zhok')
    .select('ДЦ, Категория, ЖОК')
    .in('Категория', categories)
    .neq('Поставщик', 'ПЕТРОВСКИЙ СПБ')
    .neq('Поставщик', 'Петровский ООО')
    .neq('Поставщик', 'ПИКАРС ООО')
    .gte('Дата', start)
    .lte('Дата', end)

  if (currentError) {
    console.error('Error fetching current sales:', currentError)
    return { current: [], previous: [], appg: [] }
  }

  const [previous, appg] = await Promise.all([
    fetchSalesDataForPeriod(categories, date.subtract(1, 'month')),
    fetchSalesDataForPeriod(categories, date.subtract(1, 'year')),
  ])

  return {
    current: current || [],
    previous: previous || [],
    appg: appg || [],
  }
}

// Вспомогательная функция для загрузки данных за период
async function fetchSalesDataForPeriod(categories, date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('vin_zhok')
    .select('ДЦ, Категория, ЖОК')
    .in('Категория', categories)
    .neq('Поставщик', 'ПЕТРОВСКИЙ СПБ')
    .neq('Поставщик', 'Петровский ООО')
    .neq('Поставщик', 'ПИКАРС ООО')
    .gte('Дата', start)
    .lte('Дата', end)

  if (error) {
    console.error(`Error fetching sales for ${start}:`, error)
    return []
  }
  return data || []
}

// Загрузка данных сервиса за месяц
async function fetchServiceMonthData(tableName, date) {
  const start = date.startOf('month').format('YYYY-MM-DD')
  const end = date.endOf('month').format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .gte('Дата', start)
    .lte('Дата', end)

  if (error) {
    console.error(`Error fetching ${tableName} data:`, error)
    return []
  }
  return data || []
}

// Загрузка баланса
async function fetchBalanceData() {
  const { data, error } = await supabase
    .from('balance')
    .select('Активы, Значение')

  if (error) {
    console.error('Error fetching balance:', error)
    return []
  }
  return data
}
