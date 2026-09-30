import { useContext } from 'react'
import { ThemeContext } from '../context/theme-context'

export type { Theme } from '../context/theme-context'

/**
 * อ่านธีมจาก ThemeContext — ต้องอยู่ภายใต้ `<ThemeContextProvider>`
 * (state ถูกยกไปที่ root เพื่อให้ ConfigProvider ของ antd เห็นค่าเดียวกัน)
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (ctx === null) {
    throw new Error('useTheme ต้องใช้ภายใต้ ThemeContextProvider')
  }
  return ctx
}
