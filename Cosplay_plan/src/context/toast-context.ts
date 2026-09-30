import { createContext } from 'react'

/**
 * Toast context (pure — แยกจาก component เพื่อ fast refresh: react-refresh/only-export-components)
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void
}

/** เวลาที่ toast หายไปเองอัตโนมัติ (ms) — คงค่าจาก toast ตัวเดิม */
export const TOAST_DISMISS_MS: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  warning: 5000,
  error: 6000,
}

export const ToastContext = createContext<ToastContextValue | null>(null)
