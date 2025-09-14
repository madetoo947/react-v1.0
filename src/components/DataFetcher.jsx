import { useState } from 'react'
import { DatePicker, Card, Row, Col, Statistic, Grid, Space, Empty } from 'antd'
import dayjs from 'dayjs'
import ServiceCard from './ServiceCard'
import BalanceCard from './BalanceCard'
import {
  calculateMetrics,
  calculateServiceMetrics,
  formatNumber,
} from '../utils/metricsCalculator'
import { useTabData } from '../hooks/useTabData'
import QueryWrapper from './QueryWrapper'

const { useBreakpoint } = Grid

const DEALER_CENTERS = [
  'Софийская',
  'Руставели',
  'Каширка',
  'Мытищи',
  'Белая Дача',
  'Выборгское',
]

const shouldDisplayCard = (metrics) => {
  return (
    metrics.factCount > 0 ||
    metrics.planCount > 0 ||
    metrics.totalJOK > 0 ||
    metrics.previous?.factCount > 0 ||
    metrics.appg?.factCount > 0
  )
}

export default function DataFetcher({ activeTab }) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const queryResult = useTabData(activeTab, selectedMonth)

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(date)
    }
  }

  // Эта функция теперь принимает `data` как аргумент.
  // Она будет вызвана из QueryWrapper только после успешной загрузки.
  const renderContent = (data) => {
    switch (activeTab) {
      case 'na':
      case 'asp': {
        const cards = DEALER_CENTERS.map((dealerName) => {
          const metrics = calculateMetrics(data, dealerName)
          if (!shouldDisplayCard(metrics)) return null
          return (
            <Card
              key={dealerName}
              title={`${dealerName} (${selectedMonth.format('MMMM YYYY')})`}
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="План"
                    value={metrics.planCount}
                    suffix="шт"
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Факт"
                    value={metrics.factCount}
                    suffix="шт"
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="Откл."
                    value={`${formatNumber(metrics.deviation)}%`}
                    valueStyle={{
                      color: metrics.deviation < 0 ? '#cf1322' : '#3f8600',
                    }}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="ЖОК"
                    value={formatNumber(metrics.totalJOK)}
                    suffix="₽"
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <Statistic
                    title="ЖОК/ед"
                    value={formatNumber(metrics.jokPerUnit)}
                    suffix="₽"
                  />
                </Col>
              </Row>
            </Card>
          )
        }).filter(Boolean)

        return cards.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {cards}
          </Space>
        ) : (
          <Empty description="Нет данных по продажам" />
        )
      }
      case 'sts':
      case 'mkc': {
        const cards = DEALER_CENTERS.map((dealerName) => {
          const metrics = calculateServiceMetrics(data, dealerName, activeTab)
          if (
            !metrics ||
            (metrics.normHoursFact === 0 && metrics.gm1Fact === 0)
          )
            return null
          return (
            <ServiceCard
              key={dealerName}
              dealerName={dealerName}
              metrics={metrics}
            />
          )
        }).filter(Boolean)

        return cards.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {cards}
          </Space>
        ) : (
          <Empty description="Нет данных по сервису" />
        )
      }
      case 'balance':
        // Теперь это безопасно, т.к. `data.current` всегда будет существовать благодаря исправлениям в dealerApi.jsx.
        return <BalanceCard data={data.current} />
      default:
        return null
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <DatePicker
        value={selectedMonth}
        onChange={handleMonthChange}
        picker="month"
        format="MMMM YYYY"
        allowClear={false}
        style={{ width: isMobile ? '100%' : 240 }}
      />
      <QueryWrapper queryResult={queryResult}>
        {/* Передаем renderContent как функцию (render prop) */}
        {(data) => renderContent(data)}
      </QueryWrapper>
    </Space>
  )
}
