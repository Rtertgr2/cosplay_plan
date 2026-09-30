import { Button, Card, Descriptions, Flex, Progress, Space, Tag, Typography } from 'antd'
import type { ProjectItem } from '../../services/projectService'
import { STATUS_LABELS } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'
import { progressOf, spentOf } from '../../utils/projectProgress'

export interface ReviewValues {
  charName: string
  seriesName: string
  note: string
  budget: number
  status: keyof typeof STATUS_LABELS
}

interface ProjectFormReviewProps {
  values: ReviewValues
  items: ProjectItem[]
  imageUrl: string
  /** ย้อนกลับไปแก้ไขขั้นที่เลือก (0–3) */
  onEditStep: (step: number) => void
}

/**
 * ขั้น ⑤ ตรวจสอบ (สเปค §7) — สรุปทุกอย่างก่อนบันทึก พร้อมปุ่มย้อนกลับไปแก้ได้
 * แสดง progress/spent จากรายการที่ติ๊ก "ซื้อแล้ว" ให้เห็นผลลัพธ์ก่อนสร้างจริง
 */
export default function ProjectFormReview({ values, items, imageUrl, onEditStep }: ProjectFormReviewProps) {
  const progress = progressOf(items)
  const spent = spentOf(items)

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        className="ui-section"
        variant="borderless"
        title="ตัวละคร"
        extra={
          <Button size="small" type="text" onClick={() => onEditStep(0)}>
            แก้ไข
          </Button>
        }
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="ชื่อตัวละคร">{values.charName || '—'}</Descriptions.Item>
          <Descriptions.Item label="ซีรีส์">{values.seriesName || '—'}</Descriptions.Item>
          <Descriptions.Item label="สถานะ">
            <Tag color="purple">{STATUS_LABELS[values.status]}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        className="ui-section"
        variant="borderless"
        title="รูปภาพ"
        extra={
          <Button size="small" type="text" onClick={() => onEditStep(1)}>
            แก้ไข
          </Button>
        }
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="ตัวอย่างรูปที่เลือก"
            style={{ maxWidth: 200, borderRadius: 'var(--radius-md)' }}
          />
        ) : (
          <Typography.Text type="secondary">ยังไม่ได้เลือกรูป</Typography.Text>
        )}
      </Card>

      <Card
        className="ui-section"
        variant="borderless"
        title="งบประมาณ"
        extra={
          <Button size="small" type="text" onClick={() => onEditStep(2)}>
            แก้ไข
          </Button>
        }
      >
        <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 8 }}>
          <Typography.Text type="secondary">ใช้จริงแล้ว</Typography.Text>
          <Typography.Text strong>
            {formatCurrency(spent)} / {formatCurrency(values.budget)}
          </Typography.Text>
        </Flex>
        <Progress percent={progress} size="small" />
      </Card>

      <Card
        className="ui-section"
        variant="borderless"
        title={`รายการวัสดุ (${items.length})`}
        extra={
          <Button size="small" type="text" onClick={() => onEditStep(3)}>
            แก้ไข
          </Button>
        }
      >
        {items.length === 0 ? (
          <Typography.Text type="secondary">ยังไม่มีรายการวัสดุ</Typography.Text>
        ) : (
          <ul style={{ margin: 0, paddingInlineStart: 'var(--space-5)' }}>
            {items.map((item, index) => (
              <li key={index} style={{ color: item.done ? 'var(--muted)' : undefined }}>
                {item.name} · {formatCurrency(item.price)}
                {item.done ? ' (ซื้อแล้ว)' : ''}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {values.note && (
        <Card className="ui-section" variant="borderless" title="บันทึกย่อ">
          <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{values.note}</Typography.Text>
        </Card>
      )}
    </Space>
  )
}
