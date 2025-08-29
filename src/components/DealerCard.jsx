import { formatNumber } from '../utils/metricsCalculator'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function DealerCard({ dealerName, date, metrics = {} }) {
  const {
    planCount = 0,
    factCount = 0,
    deviation = 0,
    totalJOK = 0,
    jokPerUnit = 0,
    growthPrevious = 0,
    growthAppg = 0,
    previous = {},
    appg = {},
  } = metrics
  const data = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
  ]
  // Создаем данные для графика из переменных
  const getChartData = () => {
    return [
      {
        name: 'АППГ',
        value: appg.factCount || 0,
        growth: `АППГ: ${appg.factCount || 0} шт`,
      },
      {
        name: 'Предыдущий',
        value: previous.factCount || 0,
        growth: `Пред.: ${previous.factCount || 0} шт (${
          growthPrevious < 0 ? '' : '+'
        }${formatNumber(growthPrevious)}%)`,
      },
      {
        name: 'Текущий',
        value: factCount,
        growth: `Тек.: ${factCount} шт (${
          growthAppg < 0 ? '' : '+'
        }${formatNumber(growthAppg)}%)`,
      },
    ]
  }

  return (
    <div className="dealer-card-container">
      <div className="card">
        <h2>
          {dealerName} ({date})
        </h2>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">План</span>
            <span className="stat-value">{planCount} шт</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Факт</span>
            <span className="stat-value">{factCount} шт</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Откл.</span>
            <span className={`stat-value ${deviation < 0 ? 'negative' : ''}`}>
              {formatNumber(deviation)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ЖОК</span>
            <span className={`stat-value ${totalJOK < 0 ? 'negative' : ''}`}>
              {formatNumber(totalJOK)} ₽
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">ЖОК/ед</span>
            <span className={`stat-value ${jokPerUnit < 0 ? 'negative' : ''}`}>
              {formatNumber(jokPerUnit)} ₽
            </span>
          </div>
        </div>

        <div className="sales-dynamics">
          <h3 className="dynamics-header">
            <span>Динамика продаж</span>
          </h3>

          <div className="dynamics-overview">
            <div className="period-column">
              <div className="period-header">Период</div>
              <div className="period-value">Текущий</div>
              <div className="period-value">Предыдущий</div>
              <div className="period-value">АППГ</div>
            </div>
            <div className="data-column">
              <div className="brand-header">Итого</div>
              <div className="brand-value">{factCount}</div>
              <div className="brand-value">{previous.factCount || 0}</div>
              <div className="brand-value">{appg.factCount || 0}</div>
            </div>
            <div className="growth-column">
              <div className="growth-header">Рост</div>
              <div className="growth-value"></div>
              <div
                className={`growth-value ${
                  growthPrevious < 0 ? 'negative' : ''
                }`}
              >
                {growthPrevious !== 0
                  ? `${formatNumber(growthPrevious)}%`
                  : '-'}
              </div>
              <div
                className={`growth-value ${growthAppg < 0 ? 'negative' : ''}`}
              >
                {growthAppg !== 0 ? `${formatNumber(growthAppg)}%` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
