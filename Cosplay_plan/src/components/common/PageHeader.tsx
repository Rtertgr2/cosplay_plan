import { Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** ปุ่ม/ปุ่ม action ฝั่งขวา (เช่น "สร้างโปรเจกต์") */
  action?: ReactNode
}

/**
 * PageHeader (Task 4) — หัวเรื่องหน้า + action ฝั่งขวา
 * เดิมชื่อ `DashboardHeader` แต่ใช้ข้ามหน้า (Dashboard / Projects) → ย้ายมาเป็นของกลาง
 * ตามสเปค §16 (component architecture)
 */
export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      wrap
      gap={16}
      style={{ marginBottom: 'var(--space-6)' }}
    >
      <Typography.Title level={1} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {action}
    </Flex>
  )
}
