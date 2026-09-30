import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  // ขนาดมาตรฐานของ antd (32px) + shape circle = ปุ่มกลกลืนกับแถบบนสุด
  // เคยบังคับ `minWidth/minHeight: 44` (target size ของมือถือ) → ใหญ่ผิดบน desktop
  // และดันเนื้อหาให้ล้นแถบ — ดู `Header.test.tsx` ที่ล็อกค่านี้ไว้
  return (
    <Button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
      icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
      shape="circle"
    />
  )
}
