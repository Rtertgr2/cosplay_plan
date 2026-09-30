import { Card, Col, Row, Skeleton, Space } from 'antd'

/**
 * PageSkeleton — โครงหน้า "กำลังโหลด" (V6)
 *
 * เดิมใช้ `PageState status="loading"` = spinner กลางจอ + ข้อความ "กำลังโหลด..."
 * ซึ่งทำให้หน้ากระโดดตอนข้อมูลมา · ใหม่นี้วาดโครงใกล้เคียงของจริงไว้ก่อน
 * เพื่อให้เลย์เอาต์ไม่กระโดด
 *
 * `data-testid="page-skeleton"` ใช้เป็นสัญญาให้เทสต์แยก skeleton ออกจาก
 * spinner ได้ (SSR ตรวจสภาพจริงไม่ได้)
 */
export type PageSkeletonVariant = 'cards' | 'detail' | 'form' | 'auth'

function CardGrid({ count }: { count: number }) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }, (_, i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <Card variant="borderless">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '60%' }} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

function DetailSkeleton() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Skeleton active title={{ width: '45%' }} paragraph={{ rows: 1 }} />
      <Card variant="borderless">
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      </Card>
      <Card variant="borderless">
        <Skeleton active paragraph={{ rows: 5 }} title={{ width: '30%' }} />
      </Card>
    </Space>
  )
}

function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card variant="borderless" style={{ maxWidth: 'var(--container-form)' }}>
      <Skeleton active paragraph={{ rows }} title={{ width: '35%' }} />
    </Card>
  )
}

export default function PageSkeleton({ variant = 'cards' }: { variant?: PageSkeletonVariant }) {
  return (
    <div data-testid="page-skeleton" aria-busy="true" aria-live="polite">
      {variant === 'cards' && <CardGrid count={6} />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'auth' && (
        <Card variant="borderless" style={{ maxWidth: 'var(--container-auth)', margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '50%' }} />
        </Card>
      )}
    </div>
  )
}
