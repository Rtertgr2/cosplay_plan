import type { CSSProperties, ReactNode } from 'react'

export type PageWidth = 'default' | 'form' | 'bare'

interface PageContainerProps {
  /** default = ความกว้างมาตรฐานแอป · form = คอลัมน์ฟอร์ม · bare = ไม่จำกัด */
  width?: PageWidth
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/** อ้าง token ใน tokens.css เสมอ (ไม่ hardcode ตัวเลข) = ค่า CSS ไม่หลุดจาก design system */
const MAX_WIDTH: Record<PageWidth, string | undefined> = {
  default: 'var(--container-max)',
  form: 'var(--container-form)',
  bare: undefined,
}

/**
 * PageContainer (T2) — กรอบ+ความกว้างมาตรฐานเดียวของทุกหน้า
 * ก่อน T2 แต่ละหน้าเขียน `maxWidth` เอง 4 แบบ (1200 / 720 / 420 / ไม่มี)
 * padding responsive อยู่ที่ class `.page-container` ใน globals.css
 */
export default function PageContainer({
  width = 'default',
  className,
  style,
  children,
}: PageContainerProps) {
  return (
    <div
      className={className ? `page-container ${className}` : 'page-container'}
      style={{ width: '100%', maxWidth: MAX_WIDTH[width], margin: '0 auto', ...style }}
    >
      {children}
    </div>
  )
}
