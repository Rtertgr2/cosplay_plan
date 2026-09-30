import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ErrorBoundary, { ErrorFallback } from './ErrorBoundary'

/**
 * T5 — กันหน้าขาว (ก่อน T5 render error = หน้าขาวเงียบ ๆ ไม่มีทางออก)
 * หมายเหตุ: renderToStaticMarkup (SSR) ไม่ catch error ใน render
 * → ทดสอบ fallback markup แยก + เส้นทางปกติ (ส่ง children ผ่าน) แทน
 */
describe('ErrorBoundary', () => {
  it('ส่ง children ผ่านเมื่อไม่มี error', () => {
    const html = renderToStaticMarkup(
      <ErrorBoundary>
        <span>เนื้อหาปกติ</span>
      </ErrorBoundary>,
    )
    expect(html).toContain('เนื้อหาปกติ')
  })

  it('fallback แสดงข้อความ error + ปุ่มลองใหม่', () => {
    const html = renderToStaticMarkup(
      <ErrorFallback message="เกิดข้อผิดพลาด" onRetry={() => {}} />,
    )
    expect(html).toContain('เกิดข้อผิดพลาด')
    expect(html).toContain('ลองใหม่')
  })
})
