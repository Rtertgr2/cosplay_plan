import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'

/**
 * V7 (T48) — AppLayout: ปุ่ม "ข้ามไปเนื้อหา" สำหรับผู้ใช้คีย์บอร์ด
 * ไม่งั้นทุกครั้งต้อง Tab ผ่านแถบบน + เมนูข้าง (ยาวมาก) ก่อนถึงเนื้อหา
 */

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'a@b.co' }, displayName: 'เรม', logout: vi.fn() }),
}))
vi.mock('../../hooks/useToast', () => ({ useToast: () => ({ addToast: vi.fn() }) }))
vi.mock('../../hooks/useTheme', () => ({ useTheme: () => ({ theme: 'dark', toggle: vi.fn() }) }))

import AppLayout from './AppLayout'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<p>เนื้อหา</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout (a11y)', () => {
  it('มีลิงก์ "ข้ามไปเนื้อหา" ที่ชี้ไปยังพื้นที่เนื้อหาจริง', () => {
    const html = render()
    expect(html).toContain('href="#main-content"')
    expect(html).toContain('id="main-content"')
  })

  it('ลิงก์ข้ามเนื้อหาซ่อนจากสายตาปกติ (ใช้คลาส skip-link ไม่ใช่ display:none)', () => {
    expect(render()).toContain('skip-link')
  })
})
