import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import { NAV_ITEMS } from '../../config/nav'

/**
 * Sidebar — เมนู desktop (≥768px) — เติม gap ของ UI-02 (P3)
 * บน mobile ซ่อนด้วย CSS แล้วใช้ MobileNav แทน
 * (responsive rules ใน globals.css พึ่ง className="sidebar" — ห้ามถอด)
 * รายการเมนูมาจาก `NAV_ITEMS` จุดเดียว (T1) เหมือน MobileNav
 */
export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="sidebar"
      aria-label="เมนูหลัก"
      style={{
        width: '220px',
        flexShrink: 0,
        padding: 'var(--space-4) var(--space-3)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <Menu
        mode="vertical"
        items={NAV_ITEMS}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{ border: 'none', background: 'transparent' }}
      />
    </nav>
  )
}
