import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ProjectItem } from '../../services/projectService'

/**
 * Task 6 — รายการวัสดุในหน้า Detail: ติ๊กซื้อแล้ว + ปุ่มไปร้าน
 * ข้อสำคัญ: markup ของลิงก์ต้องผ่าน `shopLinkRender.test.tsx` (ห้ามแก้) — เราะท์คง rel/target เดิม
 */

import ProjectItems from './ProjectItems'

const items: ProjectItem[] = [
  { name: 'วิก', price: 1200, shopLink: 'https://shopee.co.th/item/1', category: 'วิก', done: true },
  { name: 'รองเท้า', price: 1800, shopLink: '', category: 'รองเท้า' },
]

function render(list: ProjectItem[]) {
  return renderToStaticMarkup(
    <ProjectItems items={list} onToggleDone={vi.fn()} />,
  )
}

describe('ProjectItems (รายการวัสดุ + ปุ่มร้าน)', () => {
  it('แสดง checkbox ตามสถานะซื้อแล้ว', () => {
    const html = render(items)
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked=""')
  })

  it('ปุ่มไปร้าน: เปิดแท็บใหม่ + rel ปลอดภัย + มีชื่อสินค้าใน accessible name', () => {
    const html = render(items)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('aria-label="ไปที่ร้านค้า: วิก (เปิดแท็บใหม่)"')
  })

  it('รายการที่ไม่มีลิงก์ → บอกตรงๆ ไม่ใช่ปุ่มตาย', () => {
    expect(render(items)).toContain('ยังไม่มีลิงก์ร้านค้า')
  })

  it('ลิงก์อันตราย (javascript:) ไม่ถูกเรนเดอร์เป็น <a>', () => {
    const evil: ProjectItem[] = [
      { name: 'วิก', price: 1, shopLink: 'javascript:alert(1)', category: 'วิก' },
    ]
    expect(render(evil)).not.toContain('<a')
  })

  it('ไม่มีรายการ → empty state', () => {
    expect(render([])).toContain('ยังไม่มีรายการสินค้า')
  })
})
