import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteProject,
  getProjectById,
  updateProject,
  type Project,
  type UpdateProjectInput,
} from '../services/projectService'
import { toUserMessage } from '../utils/errors'

interface UseProjectResult {
  project: Project | null
  loading: boolean
  notFound: boolean
  error: string | null
  refresh: () => Promise<void>
  update: (input: UpdateProjectInput) => Promise<void>
  remove: () => Promise<void>
}

/**
 * useProject — ดึงโปรเจกต์เดียวตาม id
 * - fetch ตอน mount (และเมื่อ id เปลี่ยน)
 * - notFound เมื่อไม่มีเอกสารจริง (≠ error เครือข่าย/สิทธิ์)
 * - error ผ่าน toUserMessage (T32: ข้อความไทย ไม่ leak raw)
 */
export function useProject(id: string | undefined): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // id ล่าสุด — เอาไว้เมินคำตอบ fetch ที่กลับมาหลังสลับหน้า (race guard)
  const idRef = useRef(id)
  useEffect(() => {
    idRef.current = id
  }, [id])

  // id เปลี่ยน → กลับเป็น loading (render-phase adjustment ตาม pattern ที่ React แนะนำ
  // แทน `setLoading(true)` sync ใน effect — react-hooks/set-state-in-effect)
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setLoading(true)
  }

  // ไม่มี setState ก่อน await เลย — ทุกตัวอยู่ใน async context (ผ่าน set-state-in-effect)
  const fetchProject = useCallback(async () => {
    if (!id) return
    try {
      const data = await getProjectById(id)
      if (idRef.current !== id) return // id เปลี่ยนไปแล้ว → เมินคำตอบเก่า
      if (data) {
        setProject(data)
        setNotFound(false)
      } else {
        setProject(null)
        setNotFound(true)
      }
      setError(null)
    } catch (err) {
      if (idRef.current !== id) return
      console.error(err)
      setError(toUserMessage(err))
    } finally {
      if (idRef.current === id) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // async boundary ที่ชัดเจน — setState ทั้งหมดอยู่หลัง await จริง
    // (การเรียก async fn ตรง ๆ โดน false positive ของ set-state-in-effect — issue react/react#34905)
    ;(async () => {
      await fetchProject()
    })()
  }, [fetchProject])

  /** retry จาก event handler — โชว์ loading ระหว่างดึงใหม่ (นอก effect → sync setState ได้) */
  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    await fetchProject()
  }, [fetchProject, id])

  /** แก้ไขแล้ว sync local state ทันที (optimistic) */
  const update = useCallback(
    async (input: UpdateProjectInput): Promise<void> => {
      if (!id) throw new Error('ไม่พบ project id')
      await updateProject(id, input)
      setProject((prev) => (prev ? { ...prev, ...input } : prev))
    },
    [id],
  )

  /** ลบแล้วเคลียร์ local state */
  const remove = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('ไม่พบ project id')
    await deleteProject(id)
    setProject(null)
  }, [id])

  return {
    project,
    loading,
    notFound,
    error,
    refresh,
    update,
    remove,
  }
}
