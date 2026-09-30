import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PageState from './PageState'

/**
 * T3 — สถานะหน้า 1 แบบเดียว (ก่อน T3 มี Loading + ErrorMessage + Result ที่เขียนซ้ำใน 3 หน้า)
 * ต้องไม่พึ่ง react-router (ใช้ `href` ของ antd Button) เพื่อให้ ErrorBoundary เรียกใช้ได้
 */
describe('PageState', () => {
  it('loading แสดงสปินเนอร์ + ข้อความ + role=status', () => {
    const html = renderToStaticMarkup(<PageState status="loading" />)
    expect(html).toContain('role="status"')
    expect(html).toContain('กำลังโหลด')
  })

  it('error แสดงข้อความ + ปุ่มลองใหม่ + role=alert', () => {
    const html = renderToStaticMarkup(
      <PageState status="error" message="เชื่อมต่อไม่ได้" onRetry={() => {}} />,
    )
    expect(html).toContain('เชื่อมต่อไม่ได้')
    expect(html).toContain('ลองใหม่')
    expect(html).toContain('role="alert"')
  })

  it('notFound แสดง 404 + ปุ่มกลับหน้าหลักที่ href="/"', () => {
    const html = renderToStaticMarkup(<PageState status="notFound" />)
    expect(html).toContain('ไม่พบโปรเจกต์')
    expect(html).toContain('href="/"')
    expect(html).toContain('กลับหน้าหลัก')
  })

  it('404 ของหน้าเว็บ ใช้ title/description/action ที่ส่งเข้ามา', () => {
    const html = renderToStaticMarkup(
      <PageState
        status="404"
        title="404"
        description="ไม่พบหน้านี้ — ลิงก์อาจหมดอายุ"
        action={<a href="/">กลับหน้าหลัก</a>}
      />,
    )
    expect(html).toContain('404')
    expect(html).toContain('ไม่พบหน้านี้')
    expect(html).toContain('href="/"')
  })

  it('empty แสดงคำอธิบาย + action', () => {
    const html = renderToStaticMarkup(
      <PageState status="empty" description="ยังไม่มีรายการ" action={<button>สร้าง</button>} />,
    )
    expect(html).toContain('ยังไม่มีรายการ')
    expect(html).toContain('สร้าง')
  })
})
