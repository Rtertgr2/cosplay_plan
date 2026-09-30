import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'cosplay-theme'

// COSPLAN เป็นธีมหลัก → ค่าเริ่มต้น dark (สเปค §4.1/D3)
// ไม่ดึงจาก prefers-color-scheme: ผู้ใช้เลือกเองได้ผ่าน ThemeToggle แล้วจำไว้
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

/**
 * รวม state ธีมไว้ที่ root — ConfigProvider ของ antd และ `data-theme` attr
 * ใช้ state/เวลาเดียวกัน (กันธีม antd กับ CSS คนละใบหน้า)
 * API ที่ expose ผ่าน useTheme(): `{ theme, toggle }` คงเดิม
 */
export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
