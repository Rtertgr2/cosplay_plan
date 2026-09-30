import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ThemeContextProvider } from '../../context/ThemeContext'
import AuthLayout from './AuthLayout'

/**
 * T4 — หน้า login/register ต้องอยู่นอก app shell
 * (ก่อน T4 ทั้งสองหน้าอยู่ใต้ Layout เดียวกับหน้าแอป → ผู้ยังไม่ login เห็นเมนู/อีเมล/ออกจากระบบ)
 */
function render() {
  return renderToStaticMarkup(
    <ThemeContextProvider>
      <MemoryRouter>
        <AuthLayout />
      </MemoryRouter>
    </ThemeContextProvider>,
  )
}

describe('AuthLayout', () => {
  it('มีแถบบาง: โลโก้ COSPLAN ที่ลิงก์ / + ปุ่มสลับธีม', () => {
    const html = render()
    expect(html).toContain('COSPLAN')
    expect(html).toContain('href="/"')
    expect(html).toContain('สลับเป็นโหมด')
  })

  it('ไม่มีเมนูนำทางของแอป', () => {
    expect(render()).not.toContain('หน้าหลัก')
  })

  it('ไม่มีปุ่มออกจากระบบ (ผู้ใช้ยังไม่ login)', () => {
    expect(render()).not.toContain('ออกจากระบบ')
  })
})
