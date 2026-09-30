import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { ToastProvider } from '../context/ToastContext'
import { PROJECT_STATUS, type ProjectStatus } from '../utils/constants'
import type { Project } from '../services/projectService'

/**
 * Task 4 — Dashboard = personal workspace (สเปค §5.1)
 * mock เฉพาะขอบเขตข้อมูล (hook) — ไม่ mock component ที่ต้องการพิสูจน์เอง
 */

const projects: Project[] = Array.from({ length: 8 }, (_, i) => makeProject(i + 1))

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
    // ให้ "โปรเจกต์-1" อัปเดตล่าสุด → ถ้าโค้ดเรียงถูก 6 ล่าสุดคือ 1–6 และต้องไม่เห็น 7–8
    updatedAt: { toDate: () => new Date(`2026-09-0${9 - n}T00:00:00Z`) } as unknown as Project['updatedAt'],
  }
}

vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    projects,
    loading: false,
    error: null,
    refresh: vi.fn(),
    remove: vi.fn(),
  }),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'demo@example.com' }, displayName: 'เรม' }),
}))

import Dashboard from './Dashboard'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </MemoryRouter>,
  )
}

describe('Dashboard = workspace', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-30T15:00:00')) // บ่าย → คำทักเวลาคงที่
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ทักด้วยชื่อผู้ใช้ + ช่วงเวลา และมีปุ่มสร้างโปรเจกต์', () => {
    const html = render()
    expect(html).toContain('สวัสดี')
    expect(html).toContain('เรม')
    expect(html).toContain('สร้างโปรเจกต์')
  })

  it('แสดงโปรเจกต์ล่าสุดไม่เกิน 6 ใบ', () => {
    const html = render()
    expect(html).toContain('โปรเจกต์-6')
    expect(html).not.toContain('โปรเจกต์-7')
  })

  it('มีหัวข้อกิจกรรมล่าสุด (จาก updatedAt — ไม่เพิ่มข้อมูลใหม่)', () => {
    expect(render()).toContain('กิจกรรมล่าสุด')
  })

  it('ไม่มีช่องค้นหาบน Dashboard (ย้ายไปหน้า /projects แล้ว)', () => {
    expect(render()).not.toContain('ค้นหาชื่อตัวละคร')
  })
})
