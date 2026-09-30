import type { ProjectItem } from '../services/projectService'

/**
 * Task 6 — สลับสถานะ "ซื้อแล้ว" ของรายการสินค้า
 * pure + immutable: คืนชุดใหม่เสมอ (index นอกเขตคืนชุดเดิม) เพื่อส่งกลับเข้า `updateProject`
 */
export function toggleDoneAt(items: ProjectItem[], index: number): ProjectItem[] {
  if (index < 0 || index >= items.length) return items
  return items.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
}
