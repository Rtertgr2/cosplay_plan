import { MenuOutlined } from '@ant-design/icons'
import { Button, Drawer, Flex, Typography } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router'
import ThemeToggle from './ThemeToggle'

/** ลิงก์ในแถบบนของหน้าสาธารณะ — anchor ในหน้าเดียว (สเปค §6.1) */
const ANCHORS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#showcase', label: 'Showcase' },
]

/**
 * PublicLayout — โครงหน้าสาธารณะ (Landing) ยังไม่ต้องล็อกอิน
 * ต่างจาก `AppLayout` (มีเมนูแอป) และ `AuthLayout` (แถบบางของหน้า login)
 */
export default function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-container public-header-row">
          <Link to="/" className="public-logo">
            COSPLAN
          </Link>

          {/* จอกว้าง: anchor เรียงในแถว */}
          <nav className="public-anchors" aria-label="สารบัญหน้า">
            {ANCHORS.map((item) => (
              <a key={item.href} href={item.href} className="public-anchor">
                {item.label}
              </a>
            ))}
          </nav>

          <Flex align="center" gap="var(--space-2)" className="public-actions">
            <ThemeToggle />
            <Link to="/login" className="public-login-link">
              เข้าสู่ระบบ
            </Link>
            <Link to="/register">
              <Button type="primary">เริ่มใช้งาน</Button>
            </Link>
            {/* จอแคบ: ย้าย anchor เข้า Drawer */}
            <Button
              className="public-menu-button"
              type="text"
              icon={<MenuOutlined />}
              aria-label="เมนู"
              onClick={() => setOpen(true)}
            />
          </Flex>
        </div>
      </header>

      <Drawer title="COSPLAN" open={open} onClose={() => setOpen(false)} placement="right">
        <nav aria-label="สารบัญหน้า (มือถือ)">
          {ANCHORS.map((item) => (
            <Typography.Paragraph key={item.href} style={{ marginBottom: 'var(--space-4)' }}>
              <a href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </Typography.Paragraph>
          ))}
        </nav>
      </Drawer>
    </div>
  )
}
