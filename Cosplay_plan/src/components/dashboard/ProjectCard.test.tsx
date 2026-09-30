import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ToastProvider } from '../../context/ToastContext'
import { PROJECT_STATUS, type ProjectStatus } from '../../utils/constants'
import type { Project, ProjectItem } from '../../services/projectService'

/**
 * Task 5 — ProjectCard = portfolio item (สเปค §5.2)
 * พิสูจน์: progress/spent จากรายการสินค้า + เมนู ⋮ (Review Focus #1–2)
 */

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}))

import ProjectCard from './ProjectCard'

function item(price: number, done?: boolean): ProjectItem {
  return { name: 'วิก', price, shopLink: '', category: 'วิก', done }
}

function makeProject(over: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    ownerId: 'u1',
    charName: 'เรม',
    seriesName: 'Re:Zero',
    budget: 5000,
    status: PROJECT_STATUS.ACTIVE as ProjectStatus,
    note: '',
    imageUrl: '',
    items: [item(1200, true), item(900), item(600), item(400)],
    createdAt: { toDate: () => new Date('2026-09-01') } as unknown as Project['createdAt'],
    updatedAt: { toDate: () => new Date('2026-09-02') } as unknown as Project['updatedAt'],
    ...over,
  }
}

function render(project: Project) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ToastProvider>
        <ProjectCard project={project} onDelete={vi.fn(async () => {})} />
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('แสดงความคืบหน้า 25% และ spent / budget', () => {
    const html = render(makeProject())
    expect(html).toContain('25%')
    expect(html).toContain('฿1,200')
    expect(html).toContain('฿5,000')
  })

  it('ใช้จ่ายเกินงบ → ขึ้นป้าย "เกินงบ" และไม่เกิน 100%', () => {
    const html = render(makeProject({ items: [item(9000, true)] }))
    expect(html).toContain('เกินงบ')
    expect(html).not.toContain('200%')
  })

  it('ไม่มีรายการสินค้า → 0% และ ฿0 (ไม่ซ่อนแถบ)', () => {
    const html = render(makeProject({ items: [] }))
    expect(html).toContain('0%')
    expect(html).toContain('฿0')
  })

  it('โปรเจกต์เก่าที่ไม่มีฟิลด์ done → 0% ไม่ error', () => {
    const html = render(
      makeProject({ items: [{ name: 'วิก', price: 1200, shopLink: '', category: 'วิก' }] }),
    )
    expect(html).toContain('0%')
  })

  it('มีปุ่มเมนู ⋮ ที่มี accessible name', () => {
    expect(render(makeProject())).toContain('aria-label="เมนูโปรเจกต์"')
  })
})
