import { Typography } from 'antd'
import { Link, Outlet } from 'react-router'
import ThemeToggle from './ThemeToggle'

/**
 * AuthLayout (T4) — โครงหน้า login/register
 * แยกออกจาก AppLayout เพราะก่อนหน้านี้ทั้งสองหน้าอยู่ใต้ Layout เดียวกับหน้าแอป
 * → ผู้ที่ยังไม่ login เห็นเมนู/อีเมล/ปุ่มออกจากระบบ
 * เหลือแค่แถบบาง (โลโก้ + ปุ่มสลับธีม) แล้วให้ Outlet เป็นการ์ดกลางจอ
 */
export default function AuthLayout() {
  return (
    <div className="auth-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <header
        className="auth-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          // padding 8px (space-2) เพื่อให้แถบบางยังสูง ~56px ทั้งที่ปุ่มสูง 40px
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography.Text strong style={{ fontSize: 'var(--text-xl)', color: 'var(--accent)' }}>
            COSPLAN
          </Typography.Text>
        </Link>
        <ThemeToggle />
      </header>

      <main className="auth-main" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Outlet />
      </main>
    </div>
  )
}
