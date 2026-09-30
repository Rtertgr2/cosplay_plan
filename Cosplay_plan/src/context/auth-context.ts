import { createContext } from 'react'
import type { User } from 'firebase/auth'

/**
 * Auth context (pure — แยกจาก component เพื่อ fast refresh: react-refresh/only-export-components)
 */
export interface AuthContextValue {
  user: User | null
  loading: boolean
  /** ชื่อที่ผู้ใช้กรอกตอนสมัคร (เก็บใน Firebase Auth profile — ไม่แตะ Firestore) · null = ไม่ได้ใส่ไว้ */
  displayName: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  /** Settings: change display name (empty string clears it) */
  updateDisplayName: (displayName: string) => Promise<void>
  /** Settings: change email (Firebase forces re-auth) */
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>
  /** Settings: change password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
