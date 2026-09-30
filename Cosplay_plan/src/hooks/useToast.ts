import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from '../context/toast-context'

/**
 * useToast — เข้าถึง toast จาก ToastProvider
 * (แยกไฟล์จาก context เพื่อให้ fast refresh ใช้งานได้ — react-refresh/only-export-components)
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast ต้องใช้ภายใต้ <ToastProvider>')
  }
  return ctx
}
