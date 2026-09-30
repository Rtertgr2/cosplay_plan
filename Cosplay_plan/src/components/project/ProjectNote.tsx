import { Card, Typography } from 'antd'

export default function ProjectNote({ note }: { note: string }) {
  if (!note) return null

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <Card size="small" title="บันทึกย่อ">
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
          {note}
        </Typography.Paragraph>
      </Card>
    </div>
  )
}
