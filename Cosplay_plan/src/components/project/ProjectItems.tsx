import { Checkbox, Empty, Typography } from 'antd'
import type { ProjectItem } from '../../services/projectService'
import { isValidUrl } from '../../utils/validation'

interface ProjectItemsProps {
  items: ProjectItem[]
  /** Task 6 — ติ๊ก "ซื้อแล้ว" (หน้า Detail เป็นคนเรียก update) */
  onToggleDone?: (index: number, done: boolean) => void
}

/**
 * รายการวัสดุหน้า Detail (Task 6, สเปค §5.3)
 * - checkbox ซื้อแล้ว → progress/spent ในการ์ดเปลี่ยนตาม
 * - ปุ่ม "ไปที่ร้านค้า" เปิดแท็บใหม่ (rel=noopener noreferrer) — คง guard `isValidUrl`
 *   ไว้ เพราะ `shopLinkRender.test.tsx` (ห้ามแก้) คุ้มครองเรื่อง `javascript:` link
 */
export default function ProjectItems({ items, onToggleDone }: ProjectItemsProps) {
  if (items.length === 0) {
    return <Empty description="ยังไม่มีรายการสินค้า" />
  }

  return (
    <div>
      <Typography.Title level={5} style={{ margin: '0 0 var(--space-2)' }}>
        รายการสินค้า
      </Typography.Title>
      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) 0',
              borderTop: index === 0 ? 'none' : '1px solid var(--border-soft)',
            }}
          >
            <Checkbox
              checked={item.done === true}
              onChange={(e) => onToggleDone?.(index, e.target.checked)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  textDecoration: item.done ? 'line-through' : 'none',
                  color: item.done ? 'var(--muted)' : 'var(--fg)',
                }}
              >
                {item.name}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                {item.category}
                {item.price > 0 && ` · ฿${item.price.toLocaleString('th-TH')}`}
              </div>
            </div>
            {isValidUrl(item.shopLink) ? (
              <a
                href={item.shopLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`ไปที่ร้านค้า: ${item.name} (เปิดแท็บใหม่)`}
                style={{
                  flexShrink: 0,
                  display: 'inline-block',
                  padding: 'var(--space-1) var(--space-3)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--accent)',
                  fontSize: 'var(--text-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                ไปที่ร้านค้า
              </a>
            ) : (
              <Typography.Text
                type="secondary"
                style={{ fontSize: 'var(--text-sm)', flexShrink: 0 }}
              >
                ยังไม่มีลิงก์ร้านค้า
              </Typography.Text>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
