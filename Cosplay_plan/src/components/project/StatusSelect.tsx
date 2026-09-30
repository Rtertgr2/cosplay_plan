import { Select } from 'antd'
import { PROJECT_STATUS, STATUS_LABELS, type ProjectStatus } from '../../utils/constants'

interface StatusSelectProps {
  /** optional — ตอนอยู่ใน antd Form.Item (name="status") ค่าจะถูกฉีดโดย Form เอง */
  value?: ProjectStatus
  onChange?: (value: ProjectStatus) => void
  disabled?: boolean
}

export default function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <Select
      value={value}
      onChange={(v) => onChange?.(v as ProjectStatus)}
      disabled={disabled}
      style={{ width: '100%' }}
      options={Object.values(PROJECT_STATUS).map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
      }))}
    />
  )
}
