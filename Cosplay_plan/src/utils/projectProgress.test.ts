import { describe, expect, it } from 'vitest'
import { progressOf, spentOf, isOverBudget } from './projectProgress'
import type { ProjectItem } from '../services/projectService'

function item(over: Partial<ProjectItem> = {}): ProjectItem {
  return { name: 'ของชิ้นหนึ่ง', price: 1000, shopLink: '', category: 'วิก', ...over }
}

describe('progressOf', () => {
  it('ไม่มีรายการ → 0 (กันหารศูนย์)', () => {
    expect(progressOf([])).toBe(0)
  })

  it('โปรเจกต์เก่าที่ไม่มีฟิลด์ done → 0 (ข้อมูลเดิมต้องไม่พัง)', () => {
    expect(progressOf([item(), item()])).toBe(0)
  })

  it('ซื้อหมดทุกชิ้น → 100', () => {
    expect(progressOf([item({ done: true }), item({ done: true })])).toBe(100)
  })

  it('ซื้อ 1 จาก 4 → 25', () => {
    const items = [item({ done: true }), item(), item(), item()]
    expect(progressOf(items)).toBe(25)
  })

  it('ปัดเป็นจำนวนเต็ม (1 จาก 3 = 33)', () => {
    expect(progressOf([item({ done: true }), item(), item()])).toBe(33)
  })
})

describe('spentOf', () => {
  it('ไม่มีรายการ → 0', () => {
    expect(spentOf([])).toBe(0)
  })

  it('นับเฉพาะรายการที่ซื้อแล้ว', () => {
    const items = [item({ price: 1200, done: true }), item({ price: 1800 })]
    expect(spentOf(items)).toBe(1200)
  })

  it('รายการเก่าไม่มี done → ยังไม่มีค่าใช้จ่าย', () => {
    expect(spentOf([item({ price: 500 })])).toBe(0)
  })
})

describe('isOverBudget', () => {
  it('spent เกิน budget → true', () => {
    expect(isOverBudget([item({ price: 6000, done: true })], 5000)).toBe(true)
  })

  it('spent ไม่เกิน budget → false', () => {
    expect(isOverBudget([item({ price: 1000, done: true })], 5000)).toBe(false)
  })

  it('budget = 0 และยังไม่ได้ซื้ออะไร → false (ไม่ถือว่าเกิน)', () => {
    expect(isOverBudget([item()], 0)).toBe(false)
  })

  it('budget = 0 และซื้อแล้ว → true', () => {
    expect(isOverBudget([item({ price: 1, done: true })], 0)).toBe(true)
  })
})
