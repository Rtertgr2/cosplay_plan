import type { ProjectItem } from '../services/projectService'

/**
 * Task 2 — คำนวณความคืบหน้า/ยอดใช้จ่ายจริงจากรายการสินค้า (สเปค §4.2/D4)
 * pure function ล้วน → ทดสอบง่าย ใช้ซ้ำทั้ง Card (Task 5) และ Detail (Task 6)
 *
 * กติกา: รายการที่ `done === true` เท่านั้นที่นับ (ข้อมูลเก่าไม่มี `done` → ยังไม่นับ ไม่ error)
 */

/** ความคืบหน้า 0–100 (จำนวนเต็ม) = สัดส่วนรายการที่ซื้อ/ทำเสร็จแล้ว */
export function progressOf(items: ProjectItem[]): number {
  if (items.length === 0) return 0
  const doneCount = items.filter((item) => item.done === true).length
  return Math.round((doneCount / items.length) * 100)
}

/** ยอดใช้จ่ายจริง = ผลรวมราคารายการที่ซื้อแล้ว */
export function spentOf(items: ProjectItem[]): number {
  return items
    .filter((item) => item.done === true)
    .reduce((sum, item) => sum + (item.price ?? 0), 0)
}

/** ใช้จ่ายเกินงบไหม (budget = 0 ถือว่าไม่เกินจนกว่าจะมียอดใช้จ่ายจริง) */
export function isOverBudget(items: ProjectItem[], budget: number): boolean {
  return spentOf(items) > budget
}
