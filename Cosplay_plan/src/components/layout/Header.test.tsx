import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'

/**
 * Header = แถบบนสุด — ผู้ใช้รายงานว่า "สูงเกินไป" และ "ปุ่มเปลี่ยนธีมใหญ่เกินไป"
 * เทสต์นี้ล็อกค่าที่แก้: แถบกระชับ 56px (ไม่ใช่ default 64px ของ antd)
 * และปุ่มสลับธีมไม่ถูกบังคับกรอบ 44px
 */

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'demo@example.com' }, displayName: 'เรม', logout: vi.fn() }),
}))

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggle: vi.fn() }),
}))

import Header from './Header'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )
}

describe('Header (แถบบนสุด)', () => {
  it('สูงกระชับ 56px ไม่ใช่ 64px ตามค่า default ของ antd', () => {
    const html = render()
    expect(html).toContain('height:56px')
    expect(html).not.toContain('height:64px')
  })

  it('ไม่ฝืน line-height 64px ของ antd (ทำให้บรรทัดลอยกลางแถบ)', () => {
    expect(render()).toContain('line-height:normal')
  })

  it('ปุ่มสลับธีมไม่ถูกบังคับกรอบ 44px (เคยใหญ่เกินไป)', () => {
    const html = render()
    expect(html).not.toContain('min-width:44px')
    expect(html).not.toContain('min-height:44px')
  })

  it('ยังคงโลโก้ COSPLAN และปุ่มสลับธีมที่มี accessible name', () => {
    const html = render()
    expect(html).toContain('COSPLAN')
    expect(html).toContain('aria-label="สลับเป็นโหมดสว่าง"')
  })

  it('มีทางเข้าหน้าตั้งค่าบัญชี (ปุ่มเฟือง) ไป /settings', () => {
    const html = render()
    expect(html).toContain('href="/settings"')
    expect(html).toContain('aria-label="ตั้งค่าบัญชี"')
  })

  it('โลโก้ห้ามถูกบีจนตัดคำ (เคยขึ้นทีละตัวบนมือถือ)', () => {
    expect(render()).toContain('white-space:nowrap')
  })

  it('มือถือ: มีปุ่มเมนูบัญชี (dropdown) แทนการยุด 4 อย่างไว้ในแถวเดียว', () => {
    const html = render()
    expect(html).toContain('aria-label="เมนูบัญชี"')
    expect(html).toContain('header-account-menu')
  })

  it('จอใหญ่ยังเห็นชื่อผู้ใช้ + ปุ่มออกจากระบบแบบเดิม (ซ่อนด้วย CSS เฉพาะมือถือ)', () => {
    const html = render()
    expect(html).toContain('header-account-inline')
    expect(html).toContain('ออกจากระบบ')
  })

  it('ซ่อนฝั่งขวาด้วย media query ได้ (ห้ามใส่ display เป็น inline style — inline ชนะ CSS เสมอ)', () => {
    expect(render()).not.toMatch(/class="header-account-inline"[^>]*style="[^"]*display/)
  })
})
