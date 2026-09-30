import { describe, expect, it } from 'vitest'
import { toggleDoneAt } from './projectItems'
import type { ProjectItem } from '../services/projectService'

/**
 * Task 6 — สลับสถานะ "ซื้อแล้ว" ของรายการ (pure → ทดสอบได้โดยไม่ต้อง render)
 */

const items: ProjectItem[] = [
  { name: 'วิก', price: 1200, shopLink: '', category: 'วิก' },
  { name: 'ชุด', price: 2100, shopLink: '', category: 'ชุด', done: true },
]

describe('toggleDoneAt', () => {
  it('เปิดเป็นซื้อแล้ว', () => {
    const next = toggleDoneAt(items, 0)
    expect(next[0].done).toBe(true)
  })

  it('ปิดกลับเป็นยังไม่ซื้อ', () => {
    const next = toggleDoneAt(items, 1)
    expect(next[1].done).toBe(false)
  })

  it('ไม่แก้ของเดิม (immutable) — ของเดิมต้องยังเหมือนเดิม', () => {
    const snapshot = JSON.stringify(items)
    toggleDoneAt(items, 0)
    expect(JSON.stringify(items)).toBe(snapshot)
  })

  it('index นอกเขต → คืนค่าเดิม ไม่ error', () => {
    expect(toggleDoneAt(items, 9)).toBe(items)
  })
})
