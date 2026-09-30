import { Select } from 'antd'
import { STATUS_LABELS, STATUS_VALUES, type ProjectStatus } from '../../utils/constants'

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  const options = [
    { value: '', label: 'สถานะทั้งหมด' },
    ...STATUS_VALUES.map((status) => ({
      value: status,
      label: STATUS_LABELS[status as ProjectStatus],
    })),
  ]

  return (
    <Select
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={options}
      style={{ minWidth: 180 }}
      aria-label="กรองตามสถานะ"
    />
  )
}
