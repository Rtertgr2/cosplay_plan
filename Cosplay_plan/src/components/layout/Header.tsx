import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout as AntdLayout, Typography } from 'antd'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import ThemeToggle from './ThemeToggle'

/**
 * แถบบนสุด
 *
 * มือถือ (จอแคบ) เคยพัง: โลโก้ถูกบีจนตัวอักษรขึ้นทีละตัว เพราะฝั่งขวามี 4 อย่าง
 * (สลับธีม · ⚙️ · ชื่อผู้ใช้ · ออกจากระบบ) แย่งพื้นที่แถวเดียว
 * → มือถือใช้ **ปุ่มเมนูบัญชีปุ่มเดียว** (Dropdown) · จอใหญ่ยังแสดงแบบเต็ม
 * สลับกันด้วย CSS class (ไม่ใช้ matchMedia → ไม่มีปัญหา SSR/hydration)
 */
export default function Header() {
  const { user, displayName, logout } = useAuth()
  const { addToast } = useToast()

  const handleLogout = () => {
    logout().catch((err) => {
      console.error(err)
      addToast('error', 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่')
    })
  }

  // เมนูสำหรับมือถือ — รายการเดียวกับฝั่งขวาของจอใหญ่
  const accountMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings">ตั้งค่าบัญชี</Link> },
    { key: 'logout', icon: <LogoutOutlined />, label: 'ออกจากระบบ', danger: true },
  ]

  return (
    <AntdLayout.Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        // antd ตั้งค่าเริ่มต้นไว้ `height: 64px; line-height: 64px; padding: 0 50px`
        // → ต้อง override ทั้งสามค่า ไม่งั้นแถบสูงเปล่าและบรรทัดลอยกลาง
        height: 56,
        lineHeight: 'normal',
        padding: '0 var(--space-4)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <Link to={user ? '/dashboard' : '/'} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Typography.Text
            strong
            style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--accent)',
              // กันถูกบีจนตัดคำ (ทีละตัวอักษร) เมื่อจอแคบ
              whiteSpace: 'nowrap',
            }}
          >
            COSPLAN
          </Typography.Text>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ThemeToggle />

          {user && (
            <>
              {/* จอกว้าง: เห็นชื่อ + ⚙️ + ออกจากระบบ ติดแถว (ซ่อนที่ ≤768px) */}
              {/* display/alignment อยู่ที่ CSS class เท่านั้น — ถ้าใส่เป็น inline style
                  จะชนะ media query แล้วซ่อนมือถือไม่ได้ (เคยพังแบบนี้) */}
              <div className="header-account-inline">
                <Link to="/settings" aria-label="ตั้งค่าบัญชี">
                  <Button size="small" type="text" icon={<SettingOutlined />} />
                </Link>
                {/* ชื่อผู้ใช้ถ้ามี (ผู้สมัครใหม่) · ถ้าไม่มีใช้ email (ผู้ใช้เดิม) */}
                <Typography.Text
                  type="secondary"
                  ellipsis
                  style={{ maxWidth: 150 }}
                  title={displayName ?? user.email ?? undefined}
                >
                  {displayName ?? user.email}
                </Typography.Text>
                <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
              </div>

              {/* มือถือ: ยุดเป็นปุ่มเดียว (แสดงที่ ≤768px) */}
              <span className="header-account-menu">
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: accountMenuItems,
                    onClick: ({ key }) => {
                      if (key === 'logout') handleLogout()
                    },
                  }}
                >
                  <Button
                    type="text"
                    shape="circle"
                    icon={<UserOutlined />}
                    aria-label="เมนูบัญชี"
                  />
                </Dropdown>
              </span>
            </>
          )}
        </div>
      </div>
    </AntdLayout.Header>
  )
}
