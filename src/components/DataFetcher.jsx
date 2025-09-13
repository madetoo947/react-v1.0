import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Divider,
  Grid,
  Space,
  Typography,
  Empty,
  Result,
} from 'antd'
import ServiceCard from './ServiceCard'
import BalanceCard from './BalanceCard'
import {
  calculateMetrics,
  calculateServiceMetrics,
} from '../utils/metricsCalculator'
import LoadingIndicator from './LoadingIndicator'
import dayjs from 'dayjs'
import { useTabData } from '../hooks/useTabData'
import { useAuth } from '../contexts/AuthContext' // 1. Импортируем useAuth

const { Text } = Typography
const { useBreakpoint } = Grid

const DEALER_CENTERS = [
  'Софийская',
  'Руставели',
  'Каширка',
  'Мытищи',
  'Белая Дача',
  'Выборгское',
]

export default function DataFetcher({ activeTab }) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const { user } = useAuth() // 2. Получаем пользователя из контекста

  // 3. Передаем пользователя в наш хук
  const { data, isLoading, isError, error } = useTabData(
    activeTab,
    selectedMonth,
    user
  )

  const handleMonthChange = (date) => {
    setSelectedMonth(date)
  }

  // Упрощаем логику загрузки. Если user еще не пришел, enabled: false не даст
  // isError стать true, поэтому мы просто показываем загрузчик.
  if (isLoading) {
    return <LoadingIndicator loading={true} />
  }

  if (isError) {
    return (
      <Result
        status="warning"
        title="Не удалось загрузить данные"
        subTitle={error.message}
      />
    )
  }

  // ... остальной код компонента без изменений
  const renderNaAspCards = () => {
    // Добавляем проверку, что данные существуют
    if (!data || !data.current) return null

    return DEALER_CENTERS.map((dealerName) => {
      const dealerData = {
        current: data.current.filter((item) => item.ДЦ === dealerName),
        previous: data.previous?.filter((item) => item.ДЦ === dealerName) || [],
        appg: data.appg?.filter((item) => item.ДЦ === dealerName) || [],
        plans: data.plans?.filter((item) => item.ДЦ === dealerName) || [],
      }

      const metrics = calculateMetrics(dealerData, dealerName)
      const {
        planCount,
        factCount,
        deviation,
        totalJOK,
        jokPerUnit,
        growthPrevious,
        growthAppg,
      } = metrics

      if (!shouldDisplayCard(metrics, dealerData)) {
        return null
      }

      const salesData = [
        { name: 'АППГ', value: metrics.appg?.factCount || 0 },
        { name: 'Предыдущий', value: metrics.previous?.factCount || 0 },
        { name: 'Текущий', value: factCount },
      ]

      const planVsFactData = [
        { name: 'План', value: planCount },
        { name: 'Факт', value: factCount },
      ]

      return (
        <Card
          key={dealerName}
          title={`${dealerName} (${selectedMonth.format('MMMM YYYY')})`}
          style={{
            marginBottom: isMobile ? 12 : 16,
            borderRadius: isMobile ? 8 : 12,
          }}
          headStyle={{
            padding: isMobile ? '0 12px' : '0 24px',
          }}
          bodyStyle={{
            padding: isMobile ? 12 : 24,
          }}
          extra={
            <Tag color={deviation >= 0 ? 'green' : 'red'}>
              {formatNumber(deviation)}%
            </Tag>
          }
        >
          <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic title="План" value={planCount} suffix="шт" />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic title="Факт" value={factCount} suffix="шт" />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="ЖОК"
                value={formatNumber(totalJOK)}
                suffix="₽"
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="ЖОК на единицу"
                value={formatNumber(jokPerUnit)}
                suffix="₽"
              />
            </Col>
          </Row>

          <Divider />

          <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
            <Col xs={24} md={12}>
              <Card
                size="small"
                title="План vs Факт"
                bodyStyle={{ padding: isMobile ? 8 : 12 }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Отклонение"
                      value={formatNumber(deviation)}
                      suffix="%"
                      valueStyle={{
                        color: deviation >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: isMobile ? 14 : 16,
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="ЖОК на единицу"
                      value={formatNumber(jokPerUnit)}
                      suffix="₽"
                      valueStyle={{
                        color: jokPerUnit >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: isMobile ? 14 : 16,
                      }}
                    />
                  </Col>
                </Row>
                <Divider />
                <div style={{ height: isMobile ? 200 : 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={planVsFactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <Tooltip
                        contentStyle={{
                          fontSize: isMobile ? 12 : 14,
                          padding: isMobile ? 4 : 8,
                        }}
                      />
                      <Bar dataKey="value" fill="#8884d8" name="Количество" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                size="small"
                title="Динамика продаж"
                bodyStyle={{ padding: isMobile ? 8 : 12 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={8}>
                    <Statistic
                      title="Текущий"
                      value={factCount}
                      valueStyle={{ fontSize: isMobile ? 14 : 16 }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Предыдущий"
                      value={metrics.previous?.factCount || 0}
                      valueStyle={{
                        color: growthPrevious >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: isMobile ? 14 : 16,
                      }}
                      suffix={
                        growthPrevious !== 0
                          ? `${formatNumber(growthPrevious)}%`
                          : ''
                      }
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="АППГ"
                      value={metrics.appg?.factCount || 0}
                      valueStyle={{
                        color: growthAppg >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: isMobile ? 14 : 16,
                      }}
                      suffix={
                        growthAppg !== 0 ? `${formatNumber(growthAppg)}%` : ''
                      }
                    />
                  </Col>
                </Row>
                <Divider />
                <div style={{ height: isMobile ? 200 : 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={salesData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <Tooltip
                        contentStyle={{
                          fontSize: isMobile ? 12 : 14,
                          padding: isMobile ? 4 : 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#FBBB12"
                        fill="#FBBB12"
                        fillOpacity={0.3}
                        name="Продажи (шт)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )
    })
  }

  const renderServiceCards = () => {
    if (!data || !data.current) return null

    return DEALER_CENTERS.map((dealerName) => {
      const serviceData = {
        current: data.current,
        previous: data.previous,
        appg: data.appg,
        plans: data.plans,
      }

      const metrics = calculateServiceMetrics(
        serviceData,
        dealerName,
        activeTab
      )

      if (!shouldDisplayServiceCard(metrics)) {
        return null
      }

      return (
        <ServiceCard
          key={dealerName}
          dealerName={dealerName}
          metrics={metrics}
          isMobile={isMobile}
        />
      )
    })
  }

  const renderBalanceCard = () => {
    if (!data || !data.isBalance || !data.current) {
      return null
    }

    return (
      <div className="cards-container">
        <BalanceCard data={data.current} isMobile={isMobile} />
      </div>
    )
  }

  const renderContent = () => {
    if (!selectedMonth) {
      return (
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          style={{ image: { height: 60 } }}
          description={
            <Text>Данные отсутствуют, так как не выбрана дата!</Text>
          }
        />
      )
    }
    switch (activeTab) {
      case 'na':
      case 'asp':
        return <div className="cards-container">{renderNaAspCards()}</div>
      case 'sts':
      case 'mkc':
        return <div className="cards-container">{renderServiceCards()}</div> // Обернул в div для консистентности
      case 'balance':
        return renderBalanceCard()
      default:
        return null
    }
  }

  const shouldDisplayServiceCard = (metrics) => {
    return (
      metrics.normHoursFact > 0 ||
      metrics.normHoursPlan > 0 ||
      metrics.gm1Fact > 0 ||
      metrics.gm1Plan > 0
    )
  }

  return (
    <div className="tab-content active">
      <Space
        direction={screens.md ? 'horizontal' : 'vertical'}
        size="middle"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? 18 : 24,
          }}
        >
          {getTabTitle(activeTab)} - {selectedMonth.format('MM/YYYY')}
        </h2>
        <DatePicker
          value={selectedMonth}
          onChange={handleMonthChange}
          picker="month"
          format="YYYY/MM"
          style={{ width: isMobile ? '100%' : 180 }}
          allowClear={false}
          size={isMobile ? 'small' : 'middle'}
        />
      </Space>

      {renderContent()}
    </div>
  )
}

function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0.00'
  }
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

function getTabTitle(tabKey) {
  switch (tabKey) {
    case 'na':
      return 'Новые авто'
    case 'asp':
      return 'Авто с пробегом'
    case 'sts':
      return 'СТС'
    case 'mkc':
      return 'МКЦ'
    case 'balance':
      return 'Баланс'
    default:
      return ''
  }
}

function shouldDisplayCard(metrics, dealerData) {
  return (
    metrics.factCount > 0 ||
    metrics.planCount > 0 ||
    metrics.totalJOK > 0 ||
    (dealerData.previous && dealerData.previous.length > 0) ||
    (dealerData.appg && dealerData.appg.length > 0)
  )
}
