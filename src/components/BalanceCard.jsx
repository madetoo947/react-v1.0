import { Card, Row, Col, Statistic, Divider, Grid } from 'antd'
import { formatNumber } from '../utils/metricsCalculator'
import EmptyData from './EmptyData'

const { useBreakpoint } = Grid

export default function BalanceCard({ data = [] }) {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  // Если данных нет, не отображаем компонент
  if (!Array.isArray(data)) {
    return <EmptyData />
  }

  // Находим общие суммы активов и пассивов
  const totalAssetsItem = data.find((item) => item.Активы === 'Активы')
  const totalLiabilitiesItem = data.find((item) => item.Активы === 'Пассивы')
  const netAssetsItem = data.find((item) => item.Активы === 'Баланс А-П')

  // Группируем активы
  const assets = {
    money:
      data.find(
        (item) => item.Активы === 'Денежные средства (касса, расчетный счет)'
      )?.Значение || 0,
    warehouse: data.find((item) => item.Активы === 'Склады')?.Значение || 0,
    newCars:
      data.find((item) => item.Активы === 'Новые авто с ПТС, в т.ч')
        ?.Значение || 0,
    usedCars:
      data.find((item) => item.Активы === 'Склад АСП (без комиссионных)')
        ?.Значение || 0,
    spareParts:
      data.find((item) => item.Активы === 'Склад ЗЧ, в т.ч.')?.Значение || 0,
    receivables:
      data.find(
        (item) => item.Активы === 'Дебиторская задолженность дистрибьютеры'
      )?.Значение || 0,
    total: totalAssetsItem?.Значение || 0,
  }

  // Группируем пассивы
  const liabilities = {
    creditLines: [
      data.find((item) => item.Активы === 'ВТБ ВКЛ'),
      data.find((item) => item.Активы === 'РН Банк ВКЛ'),
    ].reduce((sum, item) => sum + (item?.Значение || 0), 0),
    factoring:
      data.find((item) => item.Активы === 'Факторинг ЗЧ')?.Значение || 0,
    otherLoans:
      data.find((item) => item.Активы === 'займ от 12.2023')?.Значение || 0,
    total: totalLiabilitiesItem?.Значение || 0,
  }

  // Если нет ни активов, ни пассивов, не отображаем компонент
  if (assets.total === 0 && liabilities.total === 0) {
    return null
  }

  const renderAssets = () => (
    <Card title="Активы" style={{ marginBottom: isMobile ? 16 : 0 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title="Денежные средства"
            value={formatNumber(assets.money)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Складские остатки"
            value={formatNumber(assets.warehouse)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Новые автомобили"
            value={formatNumber(assets.newCars)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Авто с пробегом"
            value={formatNumber(assets.usedCars)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Запчасти"
            value={formatNumber(assets.spareParts)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Дебиторская задолженность"
            value={formatNumber(assets.receivables)}
            prefix="₽"
          />
        </Col>
      </Row>
      <Divider />
      <Statistic
        title="Итого активы"
        value={formatNumber(assets.total)}
        prefix="₽"
        valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
      />
    </Card>
  )

  const renderLiabilities = () => (
    <Card title="Пассивы">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title="Кредитные линии"
            value={formatNumber(liabilities.creditLines)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Факторинг"
            value={formatNumber(liabilities.factoring)}
            prefix="₽"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Прочие кредиты"
            value={formatNumber(liabilities.otherLoans)}
            prefix="₽"
          />
        </Col>
      </Row>
      <Divider />
      <Statistic
        title="Итого пассивы"
        value={formatNumber(liabilities.total)}
        prefix="₽"
        valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
      />
      <Divider />
      <Statistic
        title="Чистые активы"
        value={formatNumber(netAssetsItem?.Значение || 0)}
        prefix="₽"
        valueStyle={{
          fontSize: 20,
          fontWeight: 'bold',
          color: (netAssetsItem?.Значение || 0) >= 0 ? '#3f8600' : '#cf1322',
        }}
      />
    </Card>
  )

  return isMobile ? (
    <div>
      {renderAssets()}
      {renderLiabilities()}
    </div>
  ) : (
    <Row gutter={16}>
      <Col span={12}>{renderAssets()}</Col>
      <Col span={12}>{renderLiabilities()}</Col>
    </Row>
  )
}
