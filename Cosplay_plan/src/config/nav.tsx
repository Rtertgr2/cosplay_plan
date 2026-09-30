import { HomeOutlined, PlusCircleOutlined, UnorderedListOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

// ใช้ `type` ไม่ใช่ `interface` — antd MenuItemType มี index signature
// (DataAttributes) ซึ่ง TS ให้ implicit index signature เฉพาะ type alias
export type NavItem = {
  /** path เต็ม — ใช้เป็น `key` ของ antd Menu และปลายทางตอน navigate */
  key: string
  icon: ReactNode
  label: string
}

/**
 * เมนูจุดเดียวของทั้งแอป (T1) — Sidebar (จอใหญ่) + MobileNav (มือถือ) อ่านจากที่นี่
 * ก่อนหน้านี้ทั้งสองไฟล์ประกอบ items เอง → แก้ที่เดียวแล้วอีกที่ลืม
 * เพิ่มเมนูใหม่ = แก้ที่ไฟล์นี้ที่เดียว
 */
export const NAV_ITEMS: NavItem[] = [
  { key: '/dashboard', icon: <HomeOutlined />, label: 'หน้าหลัก' },
  { key: '/projects', icon: <UnorderedListOutlined />, label: 'โปรเจกต์ของฉัน' },
  { key: '/projects/new', icon: <PlusCircleOutlined />, label: 'สร้างใหม่' },
]
