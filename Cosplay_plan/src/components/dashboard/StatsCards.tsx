import { Card, Col, Row, Statistic } from 'antd'
import type { ProjectStats } from '../../utils/projectStats'

function formatCurrency(value: number): string {
  return `฿${value.toLocaleString('th-TH')}`
}

export default function StatsCards({ stats }: { stats: ProjectStats }) {
  const cards = [
    { label: 'ทั้งหมด', value: stats.total, color: 'var(--accent)' },
    { label: 'กำลังทำ', value: stats.active, color: 'var(--meta)' },
    { label: 'เสร็จแล้ว', value: stats.completed, color: 'var(--success)' },
    { label: 'งบรวม', value: formatCurrency(stats.budgetTotal), color: 'var(--warn)' },
  ]

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 'var(--space-6)' }}>
      {cards.map((card) => (
        <Col key={card.label} xs={12} md={6}>
          <Card size="small">
            <Statistic
              title={card.label}
              value={card.value}
              // antd v6 เลิกใช้ `valueStyle` (deprecated) → ใช้ semantic `styles.content`
              styles={{ content: { color: card.color, fontWeight: 'var(--font-weight-bold)' } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
