import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ToastProvider } from '../context/ToastContext'
import { PROJECT_STATUS, type ProjectStatus } from '../utils/constants'
import type { Project } from '../services/projectService'

/**
 * Task 4 — หน้า /projects (สเปค §5.4) — การ์ดค้นหาย้ายมาที่นี่จาก Dashboard
 */

function makeProject(n: number): Project {
  return {
    id: `id-${n}`,
    ownerId: 'u1',
    charName: `โปรเจกต์-${n}`,
    seriesName: `ซีรีส์-${n}`,
    budget: 1000 * n,
    status: PROJECT_STATUS.PLANNING as ProjectStatus,
    note: '',
    imageUrl: '',
    items: [],
    createdAt: { toDate: () => new Date('2026-09-01T00:00:00Z') } as unknown as Project['createdAt'],
    updatedAt: { toDate: () => new Date(`2026-09-0${n}T00:00:00Z`) } as unknown as Project['updatedAt'],
  }
}

const hookState = vi.hoisted(() => ({ loading: false }))

const projects = Array.from({ length: 8 }, (_, i) => makeProject(i + 1))

vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    projects,
    loading: hookState.loading,
    error: null,
    refresh: vi.fn(),
    remove: vi.fn(),
  }),
}))

import Projects from './Projects'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ToastProvider>
        <Projects />
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('หน้า /projects (My Projects)', () => {
  it('มีหัวข้อหน้า + ช่องค้นหา + ตัวกรองสถานะ', () => {
    const html = render()
    expect(html).toContain('โปรเจกต์ของฉัน')
    expect(html).toContain('ค้นหาชื่อตัวละคร')
    expect(html).toContain('สถานะทั้งหมด')
  })

  it('แสดงโปรเจกต์ทั้งหมด (ไม่ตัดที่ 6 แบบ Dashboard)', () => {
    const html = render()
    expect(html).toContain('โปรเจกต์-7')
    expect(html).toContain('โปรเจกต์-8')
  })

  it('เรียงใหม่สุดขึ้นก่อน', () => {
    const html = render()
    expect(html.indexOf('โปรเจกต์-8')).toBeLessThan(html.indexOf('โปรเจกต์-1"'))
  })

  it('ตอนโหลดข้อมูล แสดง skeleton', () => {
    hookState.loading = true
    const html = render()
    hookState.loading = false
    expect(html).toContain('data-testid="page-skeleton"')
    expect(html).not.toContain('กำลังโหลด...')
  })
})
