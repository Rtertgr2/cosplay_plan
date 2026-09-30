import { App } from 'antd'
import { useCallback, type ReactNode } from 'react'
import { ToastContext, TOAST_DISMISS_MS, type ToastType } from './toast-context'

export type { ToastContextValue, ToastType } from './toast-context'

/**
 * ToastProvider — คง API `addToast(type, message)` เหมือน toast ตัวเดิม
 * แต่ render ด้วย antd notification (ผ่าน App.useApp() — static methods ไม่เห็น context)
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { notification } = App.useApp()

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const config = {
        message,
        duration: TOAST_DISMISS_MS[type],
        placement: 'topRight' as const,
      }
      switch (type) {
        case 'success':
          notification.success(config)
          break
        case 'error':
          notification.error(config)
          break
        case 'warning':
          notification.warning(config)
          break
        case 'info':
          notification.info(config)
          break
      }
    },
    [notification],
  )

  return <ToastContext.Provider value={{ addToast }}>{children}</ToastContext.Provider>
}
