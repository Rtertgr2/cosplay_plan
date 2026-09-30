import { useCallback, useEffect, useRef, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from './useAuth'
import { toUserMessage } from '../utils/errors'
import { PROJECT_STATUS } from '../utils/constants'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type CreateProjectInput,
  type Project,
  type UpdateProjectInput,
} from '../services/projectService'

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
  create: (input: CreateProjectInput) => Promise<string>
  update: (id: string, input: UpdateProjectInput) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * useProjects — hook สำหรับจัดการ projects ของ user ปัจจุบัน
 * - fetch จาก Firestore ตอน login
 * - reset เมื่อ logout
 * - create/update/remove อัปเดต local state ทันที (optimistic)
 */
export function useProjects(options?: { autoFetch?: boolean }): UseProjectsResult {
  const { autoFetch = true } = options ?? {}
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  // uid ล่าสุด — เอาไว้เมินคำตอบ fetch ที่กลับมาหลังสลับบัญชี/logout (race guard)
  const uidRef = useRef<string | undefined>(user?.uid)
  useEffect(() => {
    uidRef.current = user?.uid
  }, [user])

  // login/logout → reset list + สถานะ loading (render-phase adjustment ตาม pattern
  // ที่ React แนะนำ แทน sync setState ใน effect — react-hooks/set-state-in-effect)
  const [prevUid, setPrevUid] = useState<string | undefined>(user?.uid)
  if (user?.uid !== prevUid) {
    setPrevUid(user?.uid)
    setProjects([])
    setError(null)
    setLoading(user != null && autoFetch)
  }

  // ไม่มี setState ก่อน await — ทุกตัวอยู่ใน async context (ผ่าน set-state-in-effect)
  const fetchProjects = useCallback(async (uid: string) => {
    try {
      const data = await getProjects(uid)
      if (uidRef.current !== uid) return // เปลี่ยนบัญชี/ logout ไปแล้ว → เมินคำตอบเก่า
      setProjects(data)
      setError(null)
    } catch (err) {
      if (uidRef.current !== uid) return
      console.error(err)
      setError(toUserMessage(err))
    } finally {
      if (uidRef.current === uid) setLoading(false)
    }
  }, [])

  // fetch เมื่อ login (logout reset ทำใน render-phase ด้านบนแล้ว)
  useEffect(() => {
    if (user && autoFetch) {
      // async boundary ที่ชัดเจน — setState ทั้งหมดอยู่หลัง await จริง
      // (การเรียก async fn ตรง ๆ โดน false positive ของ set-state-in-effect — issue react/react#34905)
      ;(async () => {
        await fetchProjects(user.uid)
      })()
    }
  }, [user, autoFetch, fetchProjects])

  const create = useCallback(
    async (input: CreateProjectInput): Promise<string> => {
      if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน')
      const id = await createProject(user.uid, input)
      // optimistic: เพิ่มเข้า list ทันที — เฉพาะถ้ายังอยู่บัญชีเดิม (สลับบัญชีระหว่างรอ network → เมิน)
      if (uidRef.current === user.uid) {
        const newProject: Project = {
          id,
          ownerId: user.uid,
          charName: input.charName,
          seriesName: input.seriesName ?? '',
          budget: input.budget ?? 0,
          status: input.status ?? PROJECT_STATUS.PLANNING,
          note: input.note ?? '',
          imageUrl: input.imageUrl ?? '',
          items: input.items ?? [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
        setProjects((prev) => [newProject, ...prev])
      }
      return id
    },
    [user],
  )

  const update = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<void> => {
      await updateProject(id, input)
      // optimistic: อัปเดต list ทันที
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...input } : p)),
      )
    },
    [],
  )

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteProject(id)
    // optimistic: เอาออกจาก list ทันที
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  /** retry จาก event handler — โชว์ loading ระหว่างดึงใหม่ (นอก effect → sync setState ได้) */
  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    await fetchProjects(user.uid)
  }, [user, fetchProjects])

  return { projects, loading, error, create, update, remove, refresh }
}
