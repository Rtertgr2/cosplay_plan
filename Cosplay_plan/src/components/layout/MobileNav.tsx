import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import { NAV_ITEMS } from '../../config/nav'

/**
 * MobileNav — เมนูติดขอบล่างบนมือถือ (<768px)
 * display ควบคุมโดย CSS class `.mobile-nav` ใน globals.css
 * (inline display จะชนะ media query ทำให้ nav ไม่ผโผล่บนมือถือ)
 * รายการเมนูมาจาก `NAV_ITEMS` จุดเดียว (T1) เหมือน Sidebar
 */
export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="mobile-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Menu
        mode="horizontal"
        items={NAV_ITEMS}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{
          border: 'none',
          justifyContent: 'space-around',
          width: '100%',
          height: 64,
        }}
      />
    </nav>
  )
}
