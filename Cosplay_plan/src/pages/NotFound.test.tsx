import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import NotFound from './NotFound'

/**
 * T35 — not-found / invalid route
 * case 1: unknown route → NotFound page (route `*` ใน App.tsx)
 * case 2/3: missing/deleted project → useProject.notFound → หน้า "ไม่พบโปรเจกต์"
 * case 4: malformed id → doc() throw ใน async → rejection → catch ของ useProject (ไม่ uncaught)
 */
describe('NotFound page (T35)', () => {
  it('แสดง 404 + ข้อความไทย + ลิงก์กลับหน้าหลัก', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <NotFound />
      </MemoryRouter>,
    )
    expect(html).toContain('404')
    expect(html).toContain('ไม่พบหน้านี้')
    expect(html).toContain('href="/"')
  })
})
