import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ToastProvider } from '../context/ToastContext'
import { PROJECT_STATUS, type ProjectStatus } from '../utils/constants'
import type { Project, ProjectItem } from '../services/projectService'

/**
 * Task 6/7 — ProjectDetail (หน้า showcase) ต้อง render ได้จริง
 * เทสต์นี้กัน error แบบ "X is not defined" ในหน้าที่ซับซ้อนที่สุดของแอป
 * (เคยเจอจริงจาก Vite เสิร์ฟโมดูลเก่า — ErrorBoundary กันไว้ให้แล้ว แต่หน้าเพี้ยน)
 */

function item(name: string, price: number, over: Partial<ProjectItem> = {}): ProjectItem {
  return { name, price, shopLink: '', category: 'วิก', ...over }
}

function makeProject(over: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    ownerId: 'u1',
    charName: 'เรม',
    seriesName: 'Re:Zero',
    budget: 5000,
    status: PROJECT_STATUS.ACTIVE as ProjectStatus,
    note: 'จดไว้ทดสอบ',
    imageUrl: '',
    items: [
      item('วิก', 1200, { done: true, shopLink: 'https://shopee.co.th/item/1' }),
      item('ชุด', 2000, { done: true }),
      item('รองเท้า', 1800),
      item('ผม', 900),
    ],
    createdAt: { toDate: () => new Date('2026-09-01') } as unknown as Project['createdAt'],
    updatedAt: { toDate: () => new Date('2026-09-02') } as unknown as Project['updatedAt'],
    ...over,
  }
}

const update = vi.fn(async () => {})
const hookState = vi.hoisted(() => ({ loading: false }))

vi.mock('../hooks/useProject', () => ({
  useProject: () => ({
    project: makeProject(),
    loading: hookState.loading,
    notFound: false,
    error: null,
    remove: vi.fn(async () => {}),
    update,
  }),
}))

vi.mock('../hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

import ProjectDetail from './ProjectDetail'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/projects/p1']}>
      <ToastProvider>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('ProjectDetail render', () => {
  it('render ได้ครบ: ความคืบหน้า/งบ + ปุ่มคัดลอกลิงก์ + ปุ่มไปร้าน', () => {
    const html = render()
    expect(html).toContain('50%') // 2 จาก 4 = ซื้อแล้ว
    expect(html).toContain('฿3,200') // spent = 1200 + 2000
    expect(html).toContain('฿5,000') // budget
    expect(html).toContain('คัดลอกลิงก์')
    expect(html).toContain('ไปที่ร้านค้า')
  })

  it('ไม่ขึ้นป้ายเกินงบตอนที่ยังไม่เกิน', () => {
    expect(render()).not.toContain('เกินงบ')
  })

  it('ปุ่ม "กลับ" ชี้ไป /projects (ไม่ใช่รากเว็บ)', () => {
    expect(render()).toContain('href="/projects"')
  })

  it('ตอนโหลด แสดง skeleton (ไม่ใช่ spinner)', () => {
    hookState.loading = true
    const html = render()
    hookState.loading = false
    expect(html).toContain('data-testid="page-skeleton"')
    expect(html).not.toContain('กำลังโหลด...')
  })
})
