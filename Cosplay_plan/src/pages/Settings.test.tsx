import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'

/**
 * หน้า Settings — เรื่องบัญชีเท่านั้น (ชื่อ / อีเมล / รหัสผ่าน)
 * ไม่มี Firestore เลย → ไม่ต้องแตะ firestore.rules
 *
 * เทสต์นี้กัน 2 อย่าง: หน้า render ได้ (ไม่พังตอนรันจริง) และข้อมูลบัญชีถูกแสดง
 */

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'demo@example.com' },
    displayName: 'เรม',
    updateDisplayName: vi.fn(async () => {}),
    changeEmail: vi.fn(async () => {}),
    changePassword: vi.fn(async () => {}),
    logout: vi.fn(async () => {}),
  }),
}))

vi.mock('../hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

import Settings from './Settings'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('หน้า Settings', () => {
  it('มีหัวข้อหน้า + ทั้ง 3 ส่วน (ชื่อ / อีเมล / รหัสผ่าน)', () => {
    const html = render()
    expect(html).toContain('ตั้งค่าบัญชี')
    expect(html).toContain('ชื่อที่แสดง')
    expect(html).toContain('อีเมล')
    expect(html).toContain('เปลี่ยนรหัสผ่าน')
  })

  it('แสดงอีเมลปัจจุบันแบบอ่านอย่างเดียว (เพื่อให้ผู้ใช้รู้ว่าบัญชีคืออะไร)', () => {
    expect(render()).toContain('demo@example.com')
  })

  it('กรอกชื่อปัจจุบันไว้ในช่องให้แก้ได้เลย', () => {
    expect(render()).toContain('value="เรม"')
  })

  it('ฟอร์มเปลี่ยนอีเมล/รหัสผ่านยังพับอยู่ กดปุ่มค่อยกรอก (ไม่ต้องเผลอกดูรหัสผ่าน)', () => {
    const html = render()
    expect(html).toContain('เปลี่ยนอีเมล')
    expect(html).toContain('รหัสผ่านปัจจุบัน')
  })

  it('จัดกลุ่มกล่องให้อยู่กลางหน้า (ไม่ชิดขอบซ้าย)', () => {
    const html = render()
    // ต้องเป็น width+margin ของ **wrapper หน้า** ไม่ใช่ PageContainer (ที่มีอยู่แล้ว)
    expect(html).toContain('max-width:var(--container-form);margin:0 auto')
  })

  it('แต่ละกล่องมีช่องไฟระหว่างกัน (ไม่ติดกันเป็นก้อนเดียว)', () => {
    // gap ของ wrapper — ถ้าใช้ margin ซ้อนกัน PageHeader จะทำให้ผ่านแบบไม่ได้แก้จริง
    expect(render()).toContain('gap:var(--space-6)')
  })

  it('กำหนดความกว้างที่ wrapper ครั้งเดียว ไม่ให้แต่ละกล่องซ้ำซ้อน', () => {
    const matches = render().match(/max-width:var\(--container-form\)/g)
    expect(matches).toHaveLength(1)
  })
})
