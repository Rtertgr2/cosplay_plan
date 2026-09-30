import type { Project } from '../services/projectService'

interface FilterOptions {
  search?: string
  status?: string
}

/**
 * filterProjects — กรอง projects ตาม search + status (pure function)
 * - search: ค้นข้าม charName, seriesName, note (case-insensitive)
 * - status: ตรงตามค่า
 * - search + status ทำงานพร้อมกัน (AND)
 * - empty search/status → คืนทุกตัว
 */
export function filterProjects(projects: Project[], options: FilterOptions): Project[] {
  const { search = '', status = '' } = options
  const searchLower = search.trim().toLowerCase()

  return projects.filter((project) => {
    // status filter
    if (status && project.status !== status) return false

    // search filter
    if (searchLower) {
      const searchable = [
        project.charName,
        project.seriesName,
        project.note,
      ]
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(searchLower)) return false
    }

    return true
  })
}
