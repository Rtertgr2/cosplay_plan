import { describe, expect, it } from 'vitest'
import { NAV_ITEMS } from './nav'

/**
 * T1 — เมนูต้องมีที่เดียวทั้งแอป (Sidebar + MobileNav อ่านจากที่นี่)
 * ก่อน T1 ทั้งสองไฟล์ประกอบ items เอง → แก้เมนูที่นึงแล้วอีกที่ลืม
 */
describe('NAV_ITEMS', () => {
  it('มีหน้าหลัก + โปรเจกต์ของฉัน + สร้างใหม่ พร้อม path ที่ถูกต้อง', () => {
    expect(NAV_ITEMS.map((item) => item.key)).toEqual(['/dashboard', '/projects', '/projects/new'])
  })

  it('path ไม่ซ้ำกัน', () => {
    expect(new Set(NAV_ITEMS.map((item) => item.key)).size).toBe(NAV_ITEMS.length)
  })

  it('ทุกรายการมี label ภาษาไทย + icon', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.trim().length).toBeGreaterThan(0)
      expect(item.icon).toBeTruthy()
    }
  })
})
