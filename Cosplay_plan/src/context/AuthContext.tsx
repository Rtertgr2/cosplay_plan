import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { registerWithDisplayName, changeEmail, changePassword, updateDisplayName } from './authActions'
import { AuthContext, type AuthContextValue } from './auth-context'

export type { AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  // Task 3 — ชื่อผู้ใช้เก็บใน Firebase Auth profile (ดูรายละเอียดใน authActions.ts)
  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      await registerWithDisplayName(email, password, displayName)
    },
    [],
  )

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  // หน้า Settings — บางสิ่งต้อง re-auth ก่อน (จัดการใน authActions.ts แล้ว)
  const changeUserEmail = useCallback(
    async (currentPassword: string, newEmail: string) => {
      await changeEmail(currentPassword, newEmail)
    },
    [],
  )

  const changeUserPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await changePassword(currentPassword, newPassword)
    },
    [],
  )

  const saveDisplayName = useCallback(async (name: string) => {
    await updateDisplayName(name)
  }, [])

  const value = useMemo(
    () => ({
      user,
      displayName: user?.displayName ?? null,
      loading,
      login,
      register,
      logout,
      updateDisplayName: saveDisplayName,
      changeEmail: changeUserEmail,
      changePassword: changeUserPassword,
    }),
    [user, loading, login, register, logout, saveDisplayName, changeUserEmail, changeUserPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
