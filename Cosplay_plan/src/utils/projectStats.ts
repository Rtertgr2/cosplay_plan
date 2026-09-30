import type { Project } from '../services/projectService'

export interface ProjectStats {
  total: number
  active: number
  completed: number
  budgetTotal: number
}

/**
 * calculateStats — คำนวณสถิติจาก projects array (pure function)
 * - ไม่เรียก Firestore
 * - ไม่แก้ state
 * - ใช้ Number() กันค่า budget ที่เป็น string/undefined
 *
 * นิยาม (จาก legacy-behavior.md):
 *   active    = status === 'active'
 *   completed = status === 'completed'
 *   budgetTotal = ผลรวม budget ของทุกโปรเจกต์ (รวมที่ยกเลิกแล้วด้วย)
 */
export function calculateStats(projects: Project[]): ProjectStats {
  let active = 0
  let completed = 0
  let budgetTotal = 0

  for (const p of projects) {
    if (p.status === 'active') active++
    if (p.status === 'completed') completed++
    budgetTotal += Number(p.budget) || 0
  }

  return {
    total: projects.length,
    active,
    completed,
    budgetTotal,
  }
}
