import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PROJECT_STATUS } from '../../utils/constants'

/**
 * V5 — ฟอร์มโปรเจกต์ 5 ขั้น (สเปค §7)
 * ① ข้อมูลพื้นฐาน ② รูปภาพ ③ งบ+สถานะ ④ รายการวัสดุ ⑤ ตรวจสอบ
 * ขั้นตรวจสอบต้อง "สรุปทุกอย่าง + กลับไปแก้ได้"
 */
import ProjectFormReview from './ProjectFormReview'
import ProjectForm from './ProjectForm'

describe('ProjectFormReview (ขั้น ⑤ ตรวจสอบ)', () => {
  const values = {
    charName: 'เรม',
    seriesName: 'Re:Zero',
    note: 'ซีรีส์ที่ชอบ',
    budget: 5000,
    status: PROJECT_STATUS.ACTIVE,
  }
  const items = [
    { name: 'วิก', price: 1200, shopLink: '', category: 'วิก', done: true },
    { name: 'ชุด', price: 2000, shopLink: '', category: 'ชุด', done: true },
    { name: 'รองเท้า', price: 1800, shopLink: '', category: 'รองเท้อ' },
  ]

  it('สรุปข้อมูลพื้นฐาน + งบ + สถานะ + หมายเหตุ', () => {
    const html = renderToStaticMarkup(
      <ProjectFormReview values={values} items={items} imageUrl="" onEditStep={vi.fn()} />,
    )
    expect(html).toContain('เรม')
    expect(html).toContain('Re:Zero')
    expect(html).toContain('ซีรีส์ที่ชอบ')
    expect(html).toContain('฿5,000')
  })

  it('สรุปรายการวัสดุ + ความคืบหน้า/ยอดใช้จริง (2 จาก 3 = 67%)', () => {
    const html = renderToStaticMarkup(
      <ProjectFormReview values={values} items={items} imageUrl="" onEditStep={vi.fn()} />,
    )
    expect(html).toContain('วิก')
    expect(html).toContain('67%')
    expect(html).toContain('฿3,200') // 1200 + 2000 (เฉพาะที่ซื้อแล้ว)
  })

  it('ทุกหัวข้อมีปุ่ม "แก้ไข" เพื่อย้อนกลับไปขั้นที่ต้องการ', () => {
    const html = renderToStaticMarkup(
      <ProjectFormReview values={values} items={items} imageUrl="" onEditStep={vi.fn()} />,
    )
    expect(html.match(/แก้ไข/g)?.length).toBeGreaterThanOrEqual(3)
  })
})

describe('ProjectForm (ขั้นแรก)', () => {
  const noop = vi.fn(async () => {})

  it('ขึ้นต้นด้วย 5 ขั้นตามลำดับ และอยู่ที่ขั้น ①', () => {
    const html = renderToStaticMarkup(<ProjectForm onSubmit={noop} isSubmitting={false} />)
    for (const label of ['ข้อมูลพื้นฐาน', 'รูปภาพ', 'งบประมาณและสถานะ', 'รายการวัสดุ', 'ตรวจสอบ']) {
      expect(html).toContain(label)
    }
    // antd ทำเครื่องหมายขั้นปัจจุบันด้วย class (ไม่มี aria-current)
    expect(html).toContain('ant-steps-item-process')
  })

  it('ขั้น ① มีช่องชื่อ/ซีรีส์/หมายเหตุ และยังไม่มีปุ่มบันทึก', () => {
    const html = renderToStaticMarkup(<ProjectForm onSubmit={noop} isSubmitting={false} />)
    expect(html).toContain('ชื่อตัวละคร')
    expect(html).toContain('ชื่อซีรีส์')
    expect(html).toContain('บันทึกย่อ')
    expect(html).not.toContain('สร้างโปรเจกต์')
  })

  it('ขั้น ① ยังไม่แสดงส่วนรูปภาพ/งบ/รายการวัสดุ (ทีละขั้น)', () => {
    const html = renderToStaticMarkup(<ProjectForm onSubmit={noop} isSubmitting={false} />)
    expect(html).not.toContain('เลือกรูป')
    expect(html).not.toContain('เพิ่มรายการสินค้า')
  })
})
