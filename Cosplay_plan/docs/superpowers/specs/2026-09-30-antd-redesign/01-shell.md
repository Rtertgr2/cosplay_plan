# 01 — Shell: Layout / Header / Sidebar / MobileNav / ThemeToggle

## หลักการ

**โครงสร้าง layout เดิมคงไว้** — flex column (Header บน, Sidebar ซ้าย ≥768px, MobileNav ล่าง <768px, main ตรงกลาง)
เพราะ pattern "sidebar desktop + bottom bar mobile" ไม่ตรงกับ antd `Sider` (ที่มี breakpoint collapse ของตัวเอง) —
สลับเฉพาะส่วนเนื้อใน (innards) เป็น antd ทั้งหมด: Menu / Button / Typography → ลดความเสี่ยง responsive regression

## การ mapping

### `Layout.tsx`
- เปลี่ยน div wrapper เป็น antd `<Layout style={{ minHeight: '100vh' }}>` + `<Layout.Content>` (คง flex column arrangement ด้วย style/structure เดิม)
- คง `paddingBottom: var(--space-16)` ของ main กัน bottom bar ทับ (mobile)

### `Header.tsx`
| เดิม | antd |
|---|---|
| `<header>` + inline sticky style | คง sticky (header element เดิมหรือ `Layout.Header` + style) — background `var(--surface)`, border-bottom `var(--border)` |
| logo `<Link>` styled | `<Link>` ห่อ `Typography.Text` (strong, สี `colorPrimary`, ขนาด xl) |
| email `<span>` ellipsis | `<Typography.Text type="secondary" ellipsis style={{ maxWidth: 150 }}>` |
| ปุ่ม "ออกจากระบบ" `btn btn-outline btn-sm` | `<Button icon={<LogoutOutlined />}>ออกจากระบบ</Button>` (variant default/outline ตาม antd) |
| logic | **ไม่แตะ** — `useAuth().logout` + `addToast('error', …)` เหมือนเดิม |

### `Sidebar.tsx`
- `<ul>` + จัด style manual → **antd `<Menu mode="vertical">`**
- `items = [{ key: '/', icon: <HomeOutlined/>, label: 'หน้าหลัก' }, { key: '/projects/new', icon: <PlusCircleOutlined/>, label: 'สร้างใหม่' }]`
- selected: `selectedKeys={[location.pathname]}` (แทน logic `isActive` เดิม — antd จัดเอง)
- navigate: `onClick={({ key }) => navigate(key)}` (หรือ label ห่อ Link — เลือกแบบ navigate ให้ Menu จัด active ได้สมบูรณ์)
- คง `<nav className="sidebar" aria-label="เมนูหลัก">` wrapper — **CSS media query `.sidebar { display: none/block }` คงเดิม** (ซ่อน <768px)
- ไอคอน emoji `🏠 ➕` → antd icons

### `MobileNav.tsx`
- คง `<nav className="mobile-nav">` fixed bottom + media query เดิม
- innards → **antd `<Menu mode="horizontal">`** items/selectedKeys เหมือน Sidebar
- สไตล์ container (border-top, background) คงจาก tokens ใหม่

### `ThemeToggle.tsx`
- `<button className="btn …">` → `<Button aria-label="…" icon={theme === 'dark' ? <SunOutlined/> : <MoonOutlined/>} />`
- logic `useTheme()` **ไม่แตะ** (API เดิม — ตอนนี้ state อยู่ใน ThemeContext ใหม่ แต่ hook surface เหมือนเดิม)

## ข้อกำหนดร่วม
- คง `aria-label` / `aria-current` (Menu จัด aria-selected เอง — verify)
- Responsive behavior ห้ามเปลี่ยน: desktop มี sidebar + ไม่มี bottom bar, mobile กลับกัน
- ทดสอบ: toggle theme → สลับ antd + CSS vars พร้อมกัน (ดู `09-testing.md`)
