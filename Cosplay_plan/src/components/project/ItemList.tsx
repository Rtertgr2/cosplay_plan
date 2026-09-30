import { CheckOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import type { ProjectItem } from '../../services/projectService'
import { isValidUrl } from '../../utils/validation'

interface ItemListProps {
  items: ProjectItem[]
  onRemove: (index: number) => void
  readOnly?: boolean
}

/**
 * ItemList — การ์ดต่อรายการ
 * คง isValidUrl gate: ข้อมูลเก่าใน Firestore อาจมี javascript: link อยู่
 * — ห้าม render เป็น <a> (test shopLinkRender.test.tsx คุ้มครอง ห้ามแก้ assertions)
 */
export default function ItemList({ items, onRemove, readOnly }: ItemListProps) {
  if (items.length === 0) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0' }}>
        ยังไม่มีรายการสินค้า
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {items.map((item, index) => (
        <Card
          key={index}
          size="small"
          styles={{
            body: {
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
            },
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 500,
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? 'var(--muted)' : 'var(--fg)',
              }}
            >
              {item.done && <CheckOutlined style={{ color: 'var(--success)', marginInlineEnd: 6 }} />}
              {item.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
              {item.category}
              {item.price > 0 && ` · ฿${item.price.toLocaleString('th-TH')}`}
              {isValidUrl(item.shopLink) && (
                <>
                  {' · '}
                  <a
                    href={item.shopLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)' }}
                  >
                    ไปที่ร้านค้า
                  </a>
                </>
              )}
            </div>
          </div>
          {!readOnly && (
            <Button
              size="small"
              danger
              onClick={() => onRemove(index)}
              style={{ flexShrink: 0 }}
            >
              ลบ
            </Button>
          )}
        </Card>
      ))}
    </div>
  )
}
