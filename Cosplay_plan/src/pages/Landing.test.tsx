import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'

/**
 * V4 — Landing (หน้าสาธารณะที่ `/`)
 *
 * ตามสเปค §6.1: Hero + mockup UI (ไม่มี asset รูป) · Features 4 · How it works 3
 * · Showcase 3 ใบ (static) · CTA · Footer + anchor ในหน้าเดียว
 * และ "ผู้ login แล้ว → CTA เป็นไปที่ Dashboard"
 */

const authState = vi.hoisted(() => ({ user: null as { email: string } | null }))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user, displayName: null, logout: vi.fn() }),
}))

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggle: vi.fn() }),
}))

import Landing from './Landing'

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>,
  )
}

describe('Landing (หน้าสาธารณะ)', () => {
  it('มี anchor ครบ 3 ส่วนในหน้าเดียว (ไม่แตกหน้า)', () => {
    const html = render()
    expect(html).toContain('id="features"')
    expect(html).toContain('id="how-it-works"')
    expect(html).toContain('id="showcase"')
  })

  it('Hero มีข้อความหลัก + ปุ่มเริ่มวางแผน และ mockup UI (ไม่ใช่รูป)', () => {
    const html = render()
    expect(html).toContain('Plan your cosplay')
    expect(html).toContain('เริ่มวางแผน')
    expect(html).not.toContain('<img')
  })

  it('Features 4 การ์ด + How it works 3 ขั้น', () => {
    const html = render()
    for (const label of ['จัดการโปรเจกต์', 'ติดตามงบ', 'รายการวัสดุ', 'ธีมสว่าง/มืด']) {
      expect(html).toContain(label)
    }
    for (const step of ['สร้างโปรเจกต์', 'เติมรายการวัสดุ', 'ติดตามความคืบหน้า']) {
      expect(html).toContain(step)
    }
  })

  it('Showcase มีตัวอย่าง 3 ใบ (static ไม่ดึงข้อมูลจริง)', () => {
    const html = render()
    for (const name of ['เรม', 'ฮัตสึเนะ', 'โซดา']) {
      expect(html).toContain(name)
    }
  })

  it('ยังไม่ล็อกอิน → CTA ไป /login และ /register', () => {
    authState.user = null
    const html = render()
    expect(html).toContain('href="/login"')
    expect(html).toContain('href="/register"')
    expect(html).not.toContain('ไปที่ Dashboard')
  })

  it('ล็อกอินแล้ว → CTA ไป /dashboard (ไม่ใช่หน้าล็อกอิน)', () => {
    authState.user = { email: 'demo@example.com' }
    const html = render()
    expect(html).toContain('ไปที่ Dashboard')
    expect(html).toContain('href="/dashboard"')
    authState.user = null
  })
})
