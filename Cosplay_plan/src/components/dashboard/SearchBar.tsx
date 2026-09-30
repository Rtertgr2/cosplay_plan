import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder="ค้นหาชื่อตัวละคร, ซีรีส์, หรือบันทึก..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="ค้นหาโปรเจกต์"
    />
  )
}
