import { Layout as AntdLayout } from 'antd'
import { Outlet } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

/**
 * AppLayout (T6) — โครงหลักของแอป: header + sidebar (จอใหญ่) + bottom nav (มือถือ)
 * เป็น layout route → เนื้อหาหน้ามาจาก `<Outlet />` (ไม่รับ children เป็น prop)
 * ครอบเฉพาะหน้าที่ต้อง login · หน้า login/register ใช้ `AuthLayout` แทน
 * (ชื่อเดิมคือ `Layout` — เปลี่ยนเป็น AppLayout เพื่อไม่ให้สับสนกับ antd Layout)
 */
export default function AppLayout() {
  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      {/* a11y (V7/T48): ให้คีย์บอร์ดข้ามแถบบน+เมนูข้างไปเนื้อหาได้ในคลิกเดียว */}
      <a href="#main-content" className="skip-link">
        ข้ามไปเนื้อหา
      </a>
      <Header />
      <div style={{ flex: 1, display: 'flex' }}>
        <Sidebar />
        <AntdLayout.Content
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            minWidth: 0,
            paddingBottom: 'var(--space-16)',
          }}
        >
          <Outlet />
        </AntdLayout.Content>
      </div>
      <MobileNav />
    </AntdLayout>
  )
}
