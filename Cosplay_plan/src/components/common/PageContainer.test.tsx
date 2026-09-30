import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PageContainer from './PageContainer'

/**
 * T2 — กรอบ/ความกว้างหน้ามาตรฐานเดียว (ก่อน T2 แต่ละหน้าเขียน maxWidth เอง 4 แบบ)
 * ความกว้างอ้าง token ใน tokens.css เสมอ = ค่า CSS ไม่หลุดจาก design system
 */
describe('PageContainer', () => {
  it('default ใช้ความกว้างมาตรฐานของแอป (--container-max)', () => {
    const html = renderToStaticMarkup(<PageContainer>เนื้อหา</PageContainer>)
    expect(html).toContain('var(--container-max)')
  })

  it('form จำกัดความกว้างฟอร์ม (--container-form)', () => {
    const html = renderToStaticMarkup(<PageContainer width="form">เนื้อหา</PageContainer>)
    expect(html).toContain('var(--container-form)')
  })

  it('bare ไม่จำกัดความกว้าง', () => {
    const html = renderToStaticMarkup(<PageContainer width="bare">เนื้อหา</PageContainer>)
    expect(html).not.toContain('max-width')
  })

  it('ส่ง children ผ่านครบ', () => {
    const html = renderToStaticMarkup(<PageContainer>สวัสดี</PageContainer>)
    expect(html).toContain('สวัสดี')
  })
})
