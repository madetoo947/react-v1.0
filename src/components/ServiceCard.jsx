import { Card, Row, Col, Statistic, Tag, Grid } from 'antd'
import { formatNumber } from '../utils/metricsCalculator'

const { useBreakpoint } = Grid

export default function ServiceCard({ dealerName, metrics }) {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <Card
      title={dealerName}
      style={{
        marginBottom: 16,
        width: '100%',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12}>
          <Card size="small">
            <Statistic
              title="Нормо-часы (Факт/План)"
              value={`${metrics.normHoursFact} / ${metrics.normHoursPlan}`}
              suffix={
                <Tag
                  color={metrics.normHoursDeviation >= 0 ? 'green' : 'red'}
                  style={{ marginLeft: 8 }}
                >
                  {formatNumber(metrics.normHoursDeviation)}%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card size="small">
            <Statistic
              title="GM-1 (Факт/План)"
              value={`${formatNumber(metrics.gm1Fact)} / ${formatNumber(
                metrics.gm1Plan
              )}`}
              prefix="₽"
              suffix={
                <Tag
                  color={metrics.gm1Deviation >= 0 ? 'green' : 'red'}
                  style={{ marginLeft: 8 }}
                >
                  {formatNumber(metrics.gm1Deviation)}%
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
