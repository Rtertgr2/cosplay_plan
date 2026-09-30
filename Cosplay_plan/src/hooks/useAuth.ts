import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/auth-context'

/**
 * useAuth — เข้าถึง auth state จาก AuthProvider
 * (แยกไฟล์จาก context เพื่อให้ fast refresh ใช้งานได้ — react-refresh/only-export-components)
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth ต้องใช้ภายใต้ <AuthProvider>')
  }
  return ctx
}
