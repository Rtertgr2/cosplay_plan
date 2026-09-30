import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { FIRESTORE_COLLECTIONS, PROJECT_STATUS, type ProjectStatus } from '../utils/constants'

// ─── Types ────────────────────────────────────────────────────────

export interface ProjectItem {
  name: string
  price: number
  shopLink: string
  category: string
  /** ซื้อ/ทำเสร็จแล้วหรือยัง — ใช้คำนวณ progress + spent (Task 2) · ข้อมูลเก่าไม่มี = ยังไม่ซื้อ */
  done?: boolean
}

export interface Project {
  id: string
  ownerId: string
  charName: string
  seriesName: string
  budget: number
  status: ProjectStatus
  note: string
  imageUrl: string
  items: ProjectItem[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateProjectInput {
  charName: string
  seriesName?: string
  budget?: number
  status?: ProjectStatus
  note?: string
  imageUrl?: string
  items?: ProjectItem[]
}

export type UpdateProjectInput = Partial<CreateProjectInput>

// ─── Helpers ──────────────────────────────────────────────────────

function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    ownerId: data.ownerId as string,
    charName: data.charName as string,
    seriesName: (data.seriesName as string) ?? '',
    budget: (data.budget as number) ?? 0,
    status: (data.status as ProjectStatus) ?? PROJECT_STATUS.PLANNING,
    note: (data.note as string) ?? '',
    imageUrl: (data.imageUrl as string) ?? '',
    items: (data.items as ProjectItem[]) ?? [],
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────

const col = collection(db, FIRESTORE_COLLECTIONS.PROJECTS)

/** ดึง projects ทั้งหมดของ user เรียงตาม updatedAt ล่าสุด */
export async function getProjects(uid: string): Promise<Project[]> {
  const q = query(
    col,
    where('ownerId', '==', uid),
    orderBy('updatedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => toProject(d.id, d.data()))
}

/** ดึง project เดียวตาม id */
export async function getProjectById(id: string): Promise<Project | null> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toProject(snap.id, snap.data())
}

/** สร้าง project ใหม่ */
export async function createProject(
  uid: string,
  input: CreateProjectInput,
): Promise<string> {
  const ref = doc(col)
  const now = Timestamp.now()
  await setDoc(ref, {
    ownerId: uid,
    charName: input.charName,
    seriesName: input.seriesName ?? '',
    budget: input.budget ?? 0,
    status: input.status ?? PROJECT_STATUS.PLANNING,
    note: input.note ?? '',
    imageUrl: input.imageUrl ?? '',
    items: input.items ?? [],
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

/** แก้ไข project */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<void> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, id)
  await updateDoc(ref, {
    ...input,
    updatedAt: Timestamp.now(),
  })
}

/** ลบ project */
export async function deleteProject(id: string): Promise<void> {
  const ref = doc(db, FIRESTORE_COLLECTIONS.PROJECTS, id)
  await deleteDoc(ref)
}
