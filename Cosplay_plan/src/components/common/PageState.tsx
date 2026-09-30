import { Button, Empty, Flex, Result, Spin, Typography } from 'antd'
import type { ReactNode } from 'react'

export type PageStateStatus = 'loading' | 'error' | 'notFound' | '404' | 'empty'

interface PageStateProps {
  status: PageStateStatus
  /** error: หัวข้อ (default 'เกิดข้อผิดพลาด') · notFound/404: override หัวข้อได้ */
  title?: string
  /** error: ข้อความรายละเอียด · loading: ข้อความกำลังโหลด */
  message?: string
  /** 404/empty: คำอธิบายใต้หัวข้อ */
  description?: string
  onRetry?: () => void
  /** 404/empty: ปุ่ม/ปุ่ม action เติม (ถ้าไม่ส่ง = ปุ่มกลับหน้าหลัก) */
  action?: ReactNode
  /** ปลายทางปุ่ม "กลับหน้าหลัก" (default '/') */
  backTo?: string
}

/**
 * PageState (T3) — สถานะหน้า 1 แบบเดียวของทั้งแอป
 * แทน `common/Loading`, `common/ErrorMessage` และ `Result` ที่เขียนซ้ำใน Edit/Detail/NotFound
 * **ไม่พึ่ง react-router** (ใช้ `href` ของ antd Button) → ErrorBoundary เรียกใช้ได้
 * และทดสอบด้วย renderToStaticMarkup ได้โดยไม่ต้อง wrap router
 */
export default function PageState({
  status,
  title,
  message,
  description,
  onRetry,
  action,
  backTo = '/',
}: PageStateProps) {
  if (status === 'loading') {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={16}
        style={{ padding: 'var(--space-12) var(--space-4)' }}
        role="status"
        aria-live="polite"
      >
        <Spin size="large" />
        <Typography.Text type="secondary">{message ?? 'กำลังโหลด...'}</Typography.Text>
      </Flex>
    )
  }

  if (status === 'error') {
    // error ที่ retry ได้จริง (เช่น ดึงข้อมูลไม่สำเร็จ) → ปุ่ม "ลองใหม่"
    // error ที่ไม่มีทาง retry → ปุ่มกลับหน้าหลัก (ไม่ใช้ label ผิดความหมาย)
    const extra = onRetry ? (
      <Button type="primary" onClick={onRetry}>
        ลองใหม่
      </Button>
    ) : (
      <Button type="primary" href={backTo}>
        กลับหน้าหลัก
      </Button>
    )
    return (
      <div role="alert">
        <Result status="error" title={title ?? 'เกิดข้อผิดพลาด'} subTitle={message} extra={extra} />
      </div>
    )
  }

  if (status === 'notFound') {
    return (
      <Result
        status="404"
        title={title ?? 'ไม่พบโปรเจกต์'}
        extra={
          <Button type="primary" href={backTo}>
            กลับหน้าหลัก
          </Button>
        }
      />
    )
  }

  if (status === '404') {
    return (
      <Result
        status="404"
        title={title ?? '404'}
        subTitle={description}
        extra={
          action ?? (
            <Button type="primary" href={backTo}>
              กลับหน้าหลัก
            </Button>
          )
        }
      />
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Empty description={description} />
      {action && <div style={{ marginTop: 'var(--space-4)' }}>{action}</div>}
    </div>
  )
}
