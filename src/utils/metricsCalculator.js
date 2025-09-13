export const formatNumber = (num) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export const calculateMetrics = (dealerData, dealerName) => {
  // Проверяем наличие данных
  if (!dealerData || !dealerData.current) {
    return {
      planCount: 0,
      factCount: 0,
      deviation: 0,
      totalJOK: 0,
      jokPerUnit: 0,
      growthPrevious: 0,
      growthAppg: 0,
      previous: { factCount: 0 },
      appg: { factCount: 0 },
    }
  }

  // Фильтруем данные по дилеру
  const current =
    dealerData.current.filter((item) => item.ДЦ === dealerName) || []
  const previous =
    dealerData.previous?.filter((item) => item.ДЦ === dealerName) || []
  const appg = dealerData.appg?.filter((item) => item.ДЦ === dealerName) || []
  const plans = dealerData.plans?.filter((item) => item.ДЦ === dealerName) || []

  // Расчет показателей
  const totalPlanCount = plans.reduce((sum, item) => sum + (item.шт || 0), 0)
  const totalFactCount = current.length // Используем длину массива
  const totalJOK = current.reduce((sum, item) => sum + (item.ЖОК || 0), 0)

  const prevFactCount = previous.length
  const appgFactCount = appg.length

  return {
    planCount: totalPlanCount,
    factCount: totalFactCount,
    deviation: totalPlanCount
      ? ((totalFactCount - totalPlanCount) / totalPlanCount) * 100
      : 0,
    totalJOK,
    jokPerUnit: totalFactCount ? totalJOK / totalFactCount : 0,
    growthPrevious: prevFactCount
      ? ((totalFactCount - prevFactCount) / prevFactCount) * 100
      : 0,
    growthAppg: appgFactCount
      ? ((totalFactCount - appgFactCount) / appgFactCount) * 100
      : 0,
    previous: { factCount: prevFactCount },
    appg: { factCount: appgFactCount },
  }
}

export const calculateServiceMetrics = (serviceData, dealerName, tab) => {
  // Проверяем наличие данных
  if (!serviceData || !serviceData.current || !dealerName) {
    return {
      normHoursPlan: 0,
      normHoursFact: 0,
      normHoursDeviation: 0,
      gm1Plan: 0,
      gm1Fact: 0,
      gm1Deviation: 0,
    }
  }

  // Получаем плановые данные
  const planItem = serviceData.plans?.find((p) => p.ДЦ === dealerName)

  // Для STS/MKC используем разные колонки
  const nhPlan =
    planItem?.[`Оперплан текущий месяц ${tab === 'sts' ? 'СТС' : 'МКЦ'} НЧ`] ||
    0
  const gm1Plan =
    planItem?.[`Оперплан текущий месяц ${tab === 'sts' ? 'СТС' : 'МКЦ'} ЖОК`] ||
    0

  // Фактические данные
  const current = serviceData.current
  const normHoursFact = current.reduce(
    (sum, item) => sum + (item[`${dealerName} НЧ`] || 0),
    0
  )
  const gm1Fact = current.reduce(
    (sum, item) => sum + (item[`${dealerName} GM1`] || 0),
    0
  )

  const normHoursDeviation = nhPlan
    ? ((normHoursFact - nhPlan) / nhPlan) * 100
    : 0
  const gm1Deviation = gm1Plan ? ((gm1Fact - gm1Plan) / gm1Plan) * 100 : 0

  return {
    normHoursPlan: nhPlan,
    normHoursFact,
    normHoursDeviation,
    gm1Plan,
    gm1Fact,
    gm1Deviation,
  }
}
